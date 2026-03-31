import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiProperty = {
  id: string;
  name: string;
  location: string;
  price: number;
  area: number;
};

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAIResponse(
  message: string,
  availableProperties?: ReadonlyArray<AiProperty>
) {
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Returning placeholder response.");
    return {
      text: "شكراً لتواصلك معنا. سيقوم أحد أعضاء الفريق بالرد عليك قريباً.",
      score: "COLD" as const,
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context =
      availableProperties?.map((property) => {
        return `${property.name} في ${property.location}، السعر: ${property.price} ج.م، المساحة: ${property.area}م²`;
      }).join(" | ") || "لا يوجد عقارات متاحة حاليا.";

    const prompt = `
      أنت مساعد ذكي لشركة عقارات كبرى.
      العميل أرسل: "${message}"
      العقارات المتاحة لدينا: "${context}"
      
      المطلوب منك:
      1. الرد بأسلوب مهني وودود بالعربية.
      2. إذا سأل عن عقار معين أو منطقة، اقترح عليه أقرب 2-3 عقارات من القائمة أعلاه.
      3. إذا لم يذكر ميزانية، حاول سؤاله عنها بلطف.
      4. حدد "درجة اهتمام" العميل (HOT إذا سأل عن تفاصيل حجز أو سعر محدد، WARM إذا استفسر بشكل عام عن المنطقة، COLD إذا كانت الرسالة مجرد تحية).
      
      قم بالرد بتنسيق JSON:
      {
        "text": "نص الرد هنا",
        "score": "HOT" | "WARM" | "COLD",
        "suggestedPropertyId": "id_من_القائمة_إذا_وجد_تطابق"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating AI response:", error);
    return {
      text: "عذراً، حدث خطأ في معالجة طلبك.",
      score: "COLD" as const,
    };
  }
}
