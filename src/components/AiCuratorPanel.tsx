import React, { useState } from 'react';
import { Sparkles, Send, X, Bot } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Artwork } from '../data/jaxData';

interface AiCuratorPanelProps {
  artwork: Artwork;
  isArabic: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AiCuratorPanel: React.FC<AiCuratorPanelProps> = ({
  artwork,
  isArabic,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: isArabic
        ? `أهلاً بك في حي جاكس للفنون بالدرعية. أنا قيّم المعارض الذكي. يسعدني الإجابة عن أي تساؤل نقدي أو تاريخي حول عمل '${artwork.titleAr}' للفنان ${artwork.artistAr}، أو تقديم قراءات معمقة حول فلسفة المكان وعمارة الطين بوادي حنيفة.`
        : `Welcome to JAX Arts District in Diriyah. I am your AI Art Curator companion. Ask me about '${artwork.titleEn}' by ${artwork.artistEn}, its cultural resonance, or the architectural history of JAX and Wadi Hanifa!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = isArabic
    ? [
        'ما الرمزية المعمارية للعمل؟',
        'كيف يرتبط العمل ببيئة وادي حنيفة؟',
        'تاريخ تحول هناجر جاكس إلى حي للفنون',
        'شرح تقنية المواد المستخدمة'
      ]
    : [
        'What is the architectural symbolism?',
        'How does it connect to Wadi Hanifa?',
        'History of JAX industrial warehouses',
        'Explain the material technique'
      ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiKey =
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        (import.meta as any).env?.VITE_GEMINI_API_KEY ||
        '';

      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `You are the chief art curator of JAX Arts District in Diriyah, Saudi Arabia (حي جاكس للفنون بالدرعية).
Scholarly knowledge of contemporary Saudi art, Diriyah's UNESCO heritage (At-Turaif), and the Diriyah Biennale.
Current artwork in focus:
- Title: ${artwork.titleAr} (${artwork.titleEn})
- Artist: ${artwork.artistAr} (${artwork.artistEn})
- Pavilion: ${artwork.hangarCode} (${artwork.hangarNameAr})
- Medium: ${artwork.mediumAr}
- Curatorial Overview: ${artwork.curatorialEssayAr}
Respond natively and eloquently in ${isArabic ? 'Arabic' : 'English'}. Keep responses concise, insightful, and curatorial (around 2 paragraphs).`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nVisitor question: ${textToSend}` }] }
          ]
        });

        const reply = response.text || (isArabic ? 'عذراً، لم أتمكن من استحضار الرد حالياً.' : 'Unable to retrieve answer.');
        setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      } else {
        setTimeout(() => {
          let expertReply = '';
          const q = textToSend.toLowerCase();
          if (isArabic) {
            if (q.includes('رمز') || q.includes('معمار')) {
              expertReply = `يمثل عمل '${artwork.titleAr}' تكثيفاً بصرياً للهندسة النجدية التقليدية؛ فالمثلثات والفتحات لغة معمارية تاريخية وظّفها الأجداد في طين الطريف، ويُعيد الفنان صياغتها هنا بأبعاد تكنولوجية حديثة.`;
            } else if (q.includes('وادي') || q.includes('حنيفة') || q.includes('بيئة')) {
              expertReply = `يستمد حي جاكس شريانه الحيوي من محاذاة وادي حنيفة التاريخي. التكوين النحتي يعكس التدفق المستمر للمياه الجوفية وخصوبة واحة الدرعية التي شكلت مهد الحضارة واللقاء الإنساني.`;
            } else if (q.includes('تاريخ') || q.includes('جاكس') || q.includes('هناجر')) {
              expertReply = `تأسست منطقة جاكس في السبعينيات كمجمع للمستودعات الصناعية. وتحت مظلة وزارة الثقافة السعودية، تم ترميم هذه المنشآت الضخمة لتصبح عاصمة الفن المعاصر، محتضنةً بينالي الدرعية ومئات الاستوديوهات التفاعلية.`;
            } else {
              expertReply = `في خامة '${artwork.mediumAr}'، يخلق الفنان ${artwork.artistAr} توازناً دقيقاً بين صلابة المادة وانعكاس الضوء؛ مما يعزز تجربة الواقع المعزز ويجعل المتلقي شريكاً في إنتاج المعنى الفني.`;
            }
          } else {
            expertReply = `'${artwork.titleEn}' synthesizes traditional Najdi architectural vernacular with kinetic contemporary forms. Located on the lip of Wadi Hanifa, it transforms the historical mudbrick legacy of Diriyah into forward-looking spatial art.`;
          }
          setMessages((prev) => [...prev, { role: 'model', text: expertReply }]);
          setIsLoading(false);
        }, 800);
        return;
      }
    } catch (err: any) {
      console.error('Gemini curator error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: isArabic
            ? `استناداً إلى الرؤية القيّمية لبينالي الدرعية، فإن عمل '${artwork.titleAr}' يعبر عن تناغم الإنسان مع بيئة وادي حنيفة من خلال خامات ${artwork.mediumAr}.`
            : `According to JAX curatorial archives, '${artwork.titleEn}' highlights the dialogue between ancestral earth and contemporary horizons.`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-2xl max-w-2xl w-full h-[85vh] flex flex-col p-5 text-stone-100 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isArabic ? 'قيّم جاكس الذكي (Gemini)' : 'JAX AI Art Curator'}
              </h3>
              <p className="text-[11px] text-cyan-400">
                {isArabic ? 'استكشاف نقدي وتاريخي تفاعلي للأعمال' : 'Intelligent Curatorial Guide'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-1">
          {messages.map((msg, idx) => {
            const isModel = msg.role === 'model';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isModel ? 'justify-start' : 'justify-end'}`}
              >
                {isModel && (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isModel
                      ? 'bg-[#131722] border border-white/10 text-stone-200 rounded-tl-sm'
                      : 'bg-cyan-400 text-stone-950 font-medium rounded-tr-sm shadow-md shadow-cyan-400/20'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-300 animate-pulse px-2">
              <Sparkles className="w-4 h-4" />
              <span>{isArabic ? 'القيّم يستحضر الأبعاد النقدية...' : 'Curator is thinking...'}</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-stone-300 hover:text-cyan-200 transition shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder={isArabic ? 'اطرح سؤالك حول العمل أو الدرعية...' : 'Ask about this art piece or Diriyah...'}
            className="flex-1 bg-black/40 border border-white/15 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 outline-none transition"
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={isLoading || !inputText.trim()}
            className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-stone-950 flex items-center justify-center transition shrink-0 shadow-lg shadow-cyan-400/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
