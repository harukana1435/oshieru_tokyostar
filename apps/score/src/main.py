from js import Response, Headers
import json
import math

def calculate_safety_score(income: float, oshi_expense: float, essential_expense: float, recommended_amount: float) -> dict:
    """
    推し活安心度スコアを計算する
    
    Args:
        income: 月収入
        oshi_expense: 推し活費用
        essential_expense: 生活必需品費用
        recommended_amount: 推奨推し活口座入金額
    
    Returns:
        dict: スコア情報
    """
    
    # [1] 収入比率スコア (40点満点)
    income_ratio = oshi_expense / income if income > 0 else 0
    
    if income_ratio <= 0.20:
        income_ratio_score = 40
    elif income_ratio <= 0.30:
        income_ratio_score = 30
    elif income_ratio <= 0.40:
        income_ratio_score = 20
    else:
        income_ratio_score = 10
    
    # [2] 余剰金スコア (30点満点)
    surplus = income - essential_expense
    surplus_ratio = oshi_expense / surplus if surplus > 0 else float('inf')
    
    if surplus_ratio <= 1.0:
        surplus_score = 30
    elif surplus_ratio <= 1.2:
        surplus_score = 20
    elif surplus_ratio <= 1.5:
        surplus_score = 10
    else:
        surplus_score = 0
    
    # [3] 推奨額適合スコア (30点満点)
    if recommended_amount > 0:
        deviation_ratio = ((oshi_expense - recommended_amount) / recommended_amount) * 100
    else:
        deviation_ratio = 0
    
    if deviation_ratio <= 10:
        recommended_amount_score = 30
    elif deviation_ratio <= 20:
        recommended_amount_score = 20
    elif deviation_ratio <= 50:
        recommended_amount_score = 10
    else:
        recommended_amount_score = 0
    
    # 総合スコア計算
    total_score = income_ratio_score + surplus_score + recommended_amount_score
    
    # ラベル決定
    if total_score >= 80:
        label = "とても安心"
    elif total_score >= 60:
        label = "安心"
    elif total_score >= 40:
        label = "注意"
    else:
        label = "危険"
    
    return {
        "score": total_score,
        "label": label,
        "factors": {
            "incomeRatioScore": income_ratio_score,
            "surplusScore": surplus_score,
            "recommendedAmountScore": recommended_amount_score,
            "incomeRatio": round(income_ratio * 100, 2),
            "surplusRatio": round(surplus_ratio, 2) if surplus_ratio != float('inf') else 999.99,
            "recommendedDeviation": round(deviation_ratio, 2)
        }
    }

def calculate_recommended_amount(income: float, essential_expense: float) -> float:
    """
    推奨推し活口座入金額を計算する
    
    Args:
        income: 月収入
        essential_expense: 生活必需品費用
    
    Returns:
        float: 推奨入金額
    """
    # (1) 収入比率ベース: 収入の25%
    recommended_a = income * 0.25
    
    # (2) 余剰金ベース: 余剰金の80%
    surplus = income - essential_expense
    recommended_b = surplus * 0.8 if surplus > 0 else 0
    
    # 推奨額は小さい方を採用
    return min(recommended_a, recommended_b)

async def on_fetch(request) -> Response:
    """
    Cloudflare Worker のメインハンドラー
    """
    try:
        # CORS ヘッダーを設定
        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
        
        # OPTIONS リクエスト（プリフライト）の処理
        if request.method == "OPTIONS":
            return Response.new("", {
                "status": 204,
                "headers": Headers.new(cors_headers)
            })
        
        # POST リクエストのみ受け付け
        if request.method != "POST":
            return Response.new(
                json.dumps({"error": "Method not allowed"}),
                {
                    "status": 405,
                    "headers": Headers.new({
                        **cors_headers,
                        "Content-Type": "application/json"
                    })
                }
            )
        
        # リクエストボディを解析
        body = await request.json()
        
        # 必要なパラメータを取得
        income = float(body.get("income", 0))
        oshi_expense = float(body.get("oshiExpense", 0))
        essential_expense = float(body.get("essentialExpense", 0))
        
        # 推奨額を計算（リクエストに含まれていない場合）
        recommended_amount = float(body.get("recommendedAmount", 0))
        if recommended_amount == 0:
            recommended_amount = calculate_recommended_amount(income, essential_expense)
        
        # バリデーション
        if income <= 0:
            return Response.new(
                json.dumps({"error": "Income must be positive"}),
                {
                    "status": 400,
                    "headers": Headers.new({
                        **cors_headers,
                        "Content-Type": "application/json"
                    })
                }
            )
        
        # スコア計算
        result = calculate_safety_score(income, oshi_expense, essential_expense, recommended_amount)
        
        # レスポンス返却
        return Response.new(
            json.dumps(result),
            {
                "status": 200,
                "headers": Headers.new({
                    **cors_headers,
                    "Content-Type": "application/json"
                })
            }
        )
        
    except Exception as e:
        # エラーハンドリング
        error_response = {
            "error": "Internal server error",
            "message": str(e)
        }
        
        return Response.new(
            json.dumps(error_response),
            {
                "status": 500,
                "headers": Headers.new({
                    **cors_headers,
                    "Content-Type": "application/json"
                })
            }
        ) 