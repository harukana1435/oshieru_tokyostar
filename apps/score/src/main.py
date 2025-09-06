from js import Response, Headers
import json

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
        recommended_amount = float(body.get("recommendedAmount", 0))
        
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
        
        # 簡単なスコア計算
        income_ratio = oshi_expense / income if income > 0 else 0
        surplus = income - essential_expense
        
        if income_ratio <= 0.20:
            income_ratio_score = 40
        elif income_ratio <= 0.30:
            income_ratio_score = 30
        elif income_ratio <= 0.40:
            income_ratio_score = 20
        else:
            income_ratio_score = 10
        
        surplus_ratio = oshi_expense / surplus if surplus > 0 else 999.99
        if surplus_ratio <= 1.0:
            surplus_score = 30
        elif surplus_ratio <= 1.2:
            surplus_score = 20
        elif surplus_ratio <= 1.5:
            surplus_score = 10
        else:
            surplus_score = 0
        
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
        
        total_score = income_ratio_score + surplus_score + recommended_amount_score
        
        if total_score >= 80:
            label = "とても安心"
        elif total_score >= 60:
            label = "安心"
        elif total_score >= 40:
            label = "注意"
        else:
            label = "危険"
        
        # AI推奨事項を生成
        ai_recommendations = []
        if total_score >= 80:
            ai_recommendations.append("🎉 素晴らしい推し活バランスです！この調子で健康的な推し活を続けましょう。")
        elif total_score >= 60:
            ai_recommendations.append("✅ 良好な推し活バランスを保っています。現在の水準を維持しましょう。")
        elif total_score >= 40:
            ai_recommendations.append("⚠️ 推し活支出に注意が必要です。以下の改善点を検討してください。")
        else:
            ai_recommendations.append("🚨 推し活支出が危険水準です。緊急に見直しが必要です。")
        
        if income_ratio_score < 30:
            ai_recommendations.append(f"💰 収入に対する推し活支出が{round(income_ratio * 100, 1)}%と高めです。20%以内に抑えることを目標にしましょう。")
        
        if surplus_score < 20 and surplus_ratio != 999.99:
            ai_recommendations.append(f"💡 余剰金に対する推し活支出が{round(surplus_ratio, 1)}倍です。生活費の見直しで余剰金を増やすことを検討してください。")
        
        if recommended_amount_score < 20:
            if deviation_ratio > 0:
                ai_recommendations.append(f"📊 推奨額より{round(deviation_ratio, 1)}%多く支出しています。月次予算の設定をお勧めします。")
            elif deviation_ratio < -50:
                ai_recommendations.append("💸 推奨額より大幅に少ない支出です。もう少し推し活を楽しんでも良いかもしれません。")
        
        # 結果返却
        result = {
            "score": total_score,
            "label": label,
            "factors": {
                "incomeRatioScore": income_ratio_score,
                "surplusScore": surplus_score,
                "recommendedAmountScore": recommended_amount_score,
                "incomeRatio": round(income_ratio * 100, 2),
                "surplusRatio": round(surplus_ratio, 2) if surplus_ratio != 999.99 else 999.99,
                "recommendedDeviation": round(deviation_ratio, 2)
            },
            "breakdown": {
                "income": income,
                "oshiExpense": oshi_expense,
                "essentialExpense": essential_expense,
                "recommendedAmount": recommended_amount,
                "surplus": surplus,
                "incomeRatioPercent": round(income_ratio * 100, 2),
                "surplusRatioValue": round(surplus_ratio, 2) if surplus_ratio != 999.99 else 999.99,
                "deviationPercent": round(deviation_ratio, 2)
            },
            "spendingAnalysis": {
                "patterns": [],
                "insights": [],
                "recommendations": [],
                "categoryBreakdown": {},
                "transactionCount": 0,
                "averageAmount": 0
            },
            "aiRecommendations": ai_recommendations,
            "analysisData": body.get("analysisData", {})
        }
        
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
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                })
            }
        ) 