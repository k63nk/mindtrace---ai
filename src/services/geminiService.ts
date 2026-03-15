
import { GoogleGenAI, Type } from "@google/genai";
import { AIScoreResult, Job, PracticeExercise } from "@/types";

// Initialize Gemini AI with fallback for missing API key
const getAI = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.warn('Gemini API key not configured. AI features will be limited.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getAI();

/**
 * AI Generator: Tạo dữ liệu thị trường thực tế cho database
 */
export const generateMarketData = async (): Promise<{ jobs: Job[], exercises: PracticeExercise[] }> => {
  try {
    if (!ai) {
      console.warn('Gemini API not configured. Using mock data.');
      return { jobs: [], exercises: [] };
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Tạo 5 công việc (Jobs) và 5 bài tập (Exercises) thực tế cho sinh viên Việt Nam hiện nay.",
      config: {
        systemInstruction: "Bạn là một chuyên gia dữ liệu thị trường lao động. Tạo ra JSON dữ liệu phong phú, chuyên nghiệp.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  companyId: { type: Type.STRING },
                  companyName: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  location: { type: Type.STRING },
                  salary: { type: Type.STRING },
                  category: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  isHot: { type: Type.BOOLEAN }
                },
                required: ["id", "companyName", "title", "description", "category"]
              }
            },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  company: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tag: { type: Type.STRING },
                  time: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  diffColor: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["id", "title", "company", "description", "difficulty"]
              }
            }
          },
          required: ["jobs", "exercises"]
        }
      }
    });

    return JSON.parse(response.text || "{\"jobs\":[], \"exercises\":[]}");
  } catch (error) {
    console.error("AI Seeding Error:", error);
    return { jobs: [], exercises: [] };
  }
};

/**
 * Calculate overall CV score - ONLY based on keyword matching
 * Simplified: Check keywords in Skills, Strengths, Experience, Projects sections
 */
const calculateOverallScore = (matchPercentage: number): number => {
  // Score is purely based on keyword match percentage
  return Math.round(matchPercentage);
};

/**
 * Detailed CV analysis: Extract SKILLS, STRENGTHS, EXPERIENCE, PROJECTS sections
 */
const analyzeCV = (cvContent: string) => {
  const cvLower = cvContent.toLowerCase();
  
  // Extract SKILLS section
  const skillsMatch = cvContent.match(/SKILLS[\s\S]*?(?=STRENGTHS|EXPERIENCE|PROJECTS|$)/i);
  const skillsText = skillsMatch ? skillsMatch[0] : '';
  
  // Extract STRENGTHS section
  const strengthsMatch = cvContent.match(/STRENGTHS[\s\S]*?(?=SKILLS|EXPERIENCE|PROJECTS|$)/i);
  const strengthsText = strengthsMatch ? strengthsMatch[0] : '';
  
  // Extract EXPERIENCE section
  const experienceMatch = cvContent.match(/EXPERIENCE[\s\S]*?(?=SKILLS|STRENGTHS|PROJECTS|$)/i);
  const experienceText = experienceMatch ? experienceMatch[0] : '';
  
  // Extract PROJECTS section
  const projectsMatch = cvContent.match(/PROJECTS?[\s\S]*?(?=SKILLS|STRENGTHS|EXPERIENCE|$)/i);
  const projectsText = projectsMatch ? projectsMatch[0] : '';
  
  return {
    sections: {
      skills: skillsText,
      strengths: strengthsText,
      experience: experienceText,
      projects: projectsText
    }
  };
};

/**
 * Extract and match CV keywords against job requirements
 * Only checks: Skills, Strengths, Experience, Projects sections
 */
const matchCVSkills = (cvContent: string, jobKeywords: string[], jobDescription: string = ""): { matchedSkills: string[], missingSkills: string[], matchPercentage: number } => {
  const cvAnalysis = analyzeCV(cvContent);
  
  // Combine relevant sections for keyword matching
  const relevantContent = (
    cvAnalysis.sections.skills + ' ' +
    cvAnalysis.sections.strengths + ' ' +
    cvAnalysis.sections.experience + ' ' +
    cvAnalysis.sections.projects
  ).toLowerCase();
  
  const jobDescLower = jobDescription.toLowerCase();
  
  // Define synonym/related term groups for each keyword
  const synonymMap: Record<string, string[]> = {
    'product strategy': ['strategy', 'roadmap', 'vision', 'product manager', 'strategic', 'planning', 'direction'],
    'user research': ['user research', 'ux research', 'user testing', 'customer research', 'usability', 'user interview', 'user study', 'research'],
    'market analysis': ['market analysis', 'market research', 'competitive analysis', 'competitor', 'market', 'trend', 'analytics'],
    'agile methodologies': ['agile', 'scrum', 'sprint', 'kanban', 'iterative', 'agile framework'],
    'ux/ui collaboration': ['ux/ui', 'ui/ux', 'design', 'designer', 'ux', 'ui', 'collaboration'],
    'product backlog management': ['product backlog', 'backlog', 'backlog management', 'prioritization', 'prioritize'],
    'customer engagement': ['customer engagement', 'engagement', 'customer success', 'customer satisfaction', 'customer'],
    'data driven': ['data-driven', 'data driven', 'kpi', 'metrics', 'analytics', 'insights', 'analysis', 'dashboard'],
    'cross functional': ['cross-functional', 'cross functional', 'cross-team', 'collaboration']
  };
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  // Check each keyword
  jobKeywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    let isMatched = false;
    
    // 1. Check EXACT keyword match in relevant sections
    if (relevantContent.includes(keywordLower)) {
      isMatched = true;
    }
    
    // 2. Check SYNONYM/RELATED TERMS in relevant sections
    if (!isMatched) {
      const relatedTerms = synonymMap[keywordLower] || [];
      isMatched = relatedTerms.some(term => relevantContent.includes(term));
    }
    
    if (isMatched) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  });

  const matchPercentage = jobKeywords.length > 0 ? Math.round((matchedSkills.length / jobKeywords.length) * 100) : 0;
  
  return { matchedSkills, missingSkills, matchPercentage };
};

export const evaluateCVAgainstJob = async (cvContent: string, jobTitle: string, jobDesc: string, keywords: string[]): Promise<AIScoreResult> => {
  try {
    // Handle case where keywords array is empty
    if (!keywords || keywords.length === 0) {
      return {
        score: 100,
        feedback: `❌ LỖI: Tin tuyển dụng cho vị trí "${jobTitle}" chưa có từ khóa yêu cầu được thiết lập. Hãy liên hệ với doanh nghiệp để thêm keywords trước khi đánh giá CV.`,
        recommendations: [
          'Doanh nghiệp cần thiết lập keywords cho job posting tại Bước 2',
          'Ví dụ keywords cho Product Manager: Product Strategy, User Research, Market Analysis, Agile, UX/UI Collaboration',
          'Sau khi thêm keywords, ứng viên có thể submit CV để được đánh giá'
        ]
      };
    }
    
    // Only check keyword matching from Skills, Strengths, Experience, Projects
    const { matchedSkills, missingSkills, matchPercentage } = matchCVSkills(cvContent, keywords, jobDesc);
    
    // Score is purely based on keyword match percentage
    const overallScore = calculateOverallScore(matchPercentage);
    
    if (!ai) {
      // Fallback: Keyword-based evaluation only
      return { 
        score: overallScore,
        feedback: `CV của bạn match ${matchPercentage}% yêu cầu vị trí ${jobTitle}. ` +
                  (matchPercentage >= 80 
                    ? `🌟 XUẤT SẮC! CV của bạn phù hợp rất tốt với yêu cầu.` 
                    : matchPercentage >= 70
                    ? `👍 TỐT! CV của bạn có nhiều kỹ năng phù hợp.`
                    : matchPercentage >= 65
                    ? `✅ HỢP LỆ. CV bạn đạt tiêu chí tuyển dụng.`
                    : `⚠️ CẦN CẢI THIỆN. Hãy bổ sung thêm kỹ năng được yêu cầu.`) +
                  (matchedSkills.length > 0 
                    ? ` Kỹ năng khớp: ${matchedSkills.join(', ')}.` 
                    : ''),
        recommendations: [
          matchPercentage >= 80 
            ? `🌟 Ứng viên xuất sắc! Bạn có ${matchedSkills.length}/${keywords.length} kỹ năng được yêu cầu. Hãy tự tin apply!`
            : matchPercentage >= 70
            ? `👍 CV bạn có ${matchedSkills.length}/${keywords.length} kỹ năng phù hợp. Nên bổ sung: ${missingSkills.slice(0, 2).join(', ')}`
            : matchPercentage >= 65
            ? `✅ CV bạn đạt tiêu chí (${matchPercentage}% match). Tiếp tục apply!`
            : `⚠️ Prioritize learning: ${missingSkills.slice(0, 3).join(', ')}`,
          matchPercentage < 70 && missingSkills.length > 0
            ? `Bổ sung kỹ năng: ${missingSkills.slice(0, 5).join(', ')}`
            : 'CV của bạn rất phù hợp với công việc này!',
          `Điểm: ${matchPercentage}% (${matchedSkills.length}/${keywords.length} kỹ năng)`
        ] 
      };
    }
    
    // Use AI when available
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `CV Evaluation - Keyword Matching Only for position: ${jobTitle}
      
CV CONTENT:
${cvContent}

JOB INFO:
- Title: ${jobTitle}
- Description: ${jobDesc}
- Required Keywords: ${keywords.join(', ')}

CURRENT ANALYSIS:
- Keywords matched: ${matchPercentage}% (${matchedSkills.length}/${keywords.length})
- Matched skills: ${matchedSkills.join(', ')}
- Missing skills/keywords: ${missingSkills.join(', ')}
- Overall score: ${overallScore}/100

EVALUATION METHOD:
- Check keyword matching ONLY from CV sections: Skills, Strengths, Experience, Projects
- Do NOT consider: Experience years, Education level, Certifications, Languages
- Score = Keyword match percentage (0-100)
- A CV is acceptable if match ≥ 65%

IMPORTANT GUIDELINES:
- Support synonym/related term matching (e.g., "Agile" matches "Scrum")
- Consider context and phrasing variety
- Be fair in matching - if keyword meaning is present, count it
- Encourage if score ≥ 65%`,
      config: {
        systemInstruction: "Bạn là HR Expert chỉ đánh giá dựa vào KEYWORD MATCHING từ CV sections: Skills, Strengths, Experience, Projects. KHÔNG xem: kinh nghiệm, bằng cấp, chứng chỉ, ngôn ngữ. Score = % keyword match (0-100). Nếu match ≥65%, CV là OK. Hỗ trợ synonym matching. Khuyến khích nếu score tốt. Phản hồi tiếng Việt.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "recommendations"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) { 
    console.error('CV evaluation error:', error);
    return { score: 0, feedback: "Lỗi đánh giá CV", recommendations: [] }; 
  }
};

export const evaluatePracticeSolution = async (exerciseTitle: string, solution: string): Promise<AIScoreResult & { strengths: string[], weaknesses: string[] }> => {
  try {
    if (!ai) {
      // Deep content analysis for detailed feedback
      const solutionLower = solution.toLowerCase();
      const solutionWords = solution.split(/\s+/).length;
      const paragraphs = solution.split('\n\n').filter(p => p.trim().length > 0).length;
      
      // Detailed analysis indicators
      const hasExamples = solutionLower.includes('ví dụ') || solutionLower.includes('example') || solutionLower.includes('như');
      const hasExplanation = solutionLower.includes('giải thích') || solutionLower.includes('explain') || solutionLower.includes('vì');
      const hasCode = solutionLower.match(/```|function|const|let|var|=>|class|def|function/) !== null;
      const hasMetrics = solutionLower.match(/\d+%|\d+\s*(k|tr|tỷ)|roi|conversion|engagement|chỉ\s*số/) !== null;
      const hasUserInsight = solutionLower.includes('người dùng') || solutionLower.includes('user') || solutionLower.includes('khách hàng') || solutionLower.includes('customer');
      const hasBizPerspective = solutionLower.includes('kinh doanh') || solutionLower.includes('revenue') || solutionLower.includes('business');
      const hasCompetitive = solutionLower.includes('cạnh tranh') || solutionLower.includes('competitor') || solutionLower.includes('so sánh');
      const hasRiskAnalysis = solutionLower.includes('rủi ro') || solutionLower.includes('risk') || solutionLower.includes('challenge');
      const hasImplementation = solutionLower.includes('triển khai') || solutionLower.includes('implement') || solutionLower.includes('thực hiện') || solutionLower.includes('execution');
      const hasTimeline = solutionLower.includes('thời gian') || solutionLower.includes('timeline') || solutionLower.includes('phase') || solutionLower.includes('tuần');
      const hasStructure = paragraphs > 3;
      const hasIntroConclusion = solutionLower.includes('kết luận') || solutionLower.includes('conclusion') || solutionLower.includes('tóm tắt');
      
      // Score calculation: Balance between Strengths and Weaknesses
      // Count strengths (indicators of quality)
      const strengthIndicators = [
        hasExamples, hasExplanation, hasCode, hasMetrics,
        hasUserInsight, hasBizPerspective, hasCompetitive,
        hasRiskAnalysis, hasImplementation, hasTimeline,
        hasStructure, hasIntroConclusion,
        solutionWords > 500
      ].filter(Boolean).length;
      
      // Count weaknesses by severity
      const criticalWeaknessCount = [!hasUserInsight, !hasBizPerspective]
        .filter(Boolean).length;
      
      const importantWeaknessCount = [!hasMetrics, !hasImplementation, !hasRiskAnalysis]
        .filter(Boolean).length;
      
      const highWeaknessCount = [!hasCompetitive, !hasTimeline]
        .filter(Boolean).length;
      
      // Balanced scoring:
      // Base: 50
      // + Strengths: +6 for each quality indicator (max 13 indicators = potential +78)
      // - CRITICAL weakness: -12 each (min -24 if 2 critical)
      // - IMPORTANT weakness: -6 each (min -18 if 3 important)
      // - HIGH weakness: -3 each (min -6 if 2 high)
      
      let score = 50; // Base score
      
      // Add points for strengths (encourages having good elements)
      score += strengthIndicators * 6;
      
      // Subtract for weaknesses (penalties scale with severity)
      score -= criticalWeaknessCount * 12;  // CRITICAL = strong penalty
      score -= importantWeaknessCount * 6;  // IMPORTANT = moderate penalty
      score -= highWeaknessCount * 3;       // HIGH = light penalty
      
      // Ensure score stays in valid range
      score = Math.max(0, Math.min(Math.round(score), 100));
      
      // Build comprehensive strengths list
      const strengthsList: string[] = [];
      if (hasExamples) strengthsList.push('✓ Cung cấp ví dụ minh họa cụ thể và dễ hiểu');
      if (hasExplanation) strengthsList.push('✓ Giải thích logic rõ ràng, dễ theo dõi');
      if (hasUserInsight) strengthsList.push('✓ Hiểu rõ nhu cầu và hành vi người dùng');
      if (hasBizPerspective) strengthsList.push('✓ Xem xét góc nhìn kinh doanh và ROI');
      if (hasCode) strengthsList.push('✓ Sử dụng code/công cụ để minh họa giải pháp');
      if (hasMetrics) strengthsList.push('✓ Sử dụng KPI và số liệu để hỗ trợ lập luận');
      if (hasCompetitive) strengthsList.push('✓ Phân tích bối cảnh cạnh tranh và thị trường');
      if (hasImplementation) strengthsList.push('✓ Cung cấp kế hoạch triển khai cụ thể');
      if (hasIntroConclusion) strengthsList.push('✓ Bài làm có cấu trúc logic từ đầu đến cuối');
      if (solutionWords > 500) strengthsList.push('✓ Bài làm đầy đủ và chi tiết');
      
      if (strengthsList.length === 0) {
        strengthsList.push('✓ Nội dung liên quan đến chủ đề');
      }
      
      // Build comprehensive weaknesses list - ordered by importance
      const weaknessesList: string[] = [];
      if (!hasUserInsight) weaknessesList.push('! [CRITICAL] Thiếu phân tích nhu cầu và hành vi người dùng');
      if (!hasBizPerspective) weaknessesList.push('! [CRITICAL] Chưa xem xét góc nhìn kinh doanh và ROI');
      if (!hasMetrics) weaknessesList.push('! [IMPORTANT] Thiếu KPI và dữ liệu để chứng minh lập luận');
      if (!hasImplementation) weaknessesList.push('! [IMPORTANT] Chưa có kế hoạch triển khai chi tiết');
      if (!hasRiskAnalysis) weaknessesList.push('! [IMPORTANT] Chưa xem xét đủ rủi ro và thách thức');
      if (!hasCompetitive) weaknessesList.push('! [HIGH] Thiếu phân tích bối cảnh cạnh tranh');
      if (!hasTimeline) weaknessesList.push('! [HIGH] Chưa cung cấp timeline và lộ trình rõ ràng');
      if (!hasExamples) weaknessesList.push('! Thiếu ví dụ cụ thể để minh họa ý tưởng');
      if (!hasCode) weaknessesList.push('! Nên sử dụng code/công cụ để minh họa');
      if (solutionWords < 300) weaknessesList.push('! Bài làm còn ngắn, cần mở rộng thêm');
      
      if (weaknessesList.length === 0) {
        weaknessesList.push('! Có thể mở rộng phân tích thêm');
      }
      
      // Build recommendations
      const recommendationsList: string[] = [];
      recommendationsList.push(`📚 Tham khảo thêm case studies và best practices liên quan đến "${exerciseTitle}"`);
      
      if (!hasUserInsight || !hasBizPerspective) {
        recommendationsList.push('🎯 [ƯU TIÊN] Bắt đầu bằng việc hiểu nhu cầu người dùng và mục tiêu kinh doanh');
      }
      
      if (!hasMetrics) {
        recommendationsList.push('📊 Sử dụng dữ liệu và KPI cụ thể để hỗ trợ các lập luận của bạn');
      }
      
      if (!hasImplementation || !hasTimeline) {
        recommendationsList.push('⚙️ Phát triển kế hoạch triển khai chi tiết với timeline rõ ràng');
      }
      
      if (!hasRiskAnalysis) {
        recommendationsList.push('⚠️ Xem xét các rủi ro tiềm ẩn và cách mitigating chúng');
      }
      
      if (!hasCompetitive) {
        recommendationsList.push('🔍 So sánh với các giải pháp tương tự từ các công ty hàng đầu');
      }
      
      recommendationsList.push('💬 Nhận feedback từ mentor hoặc đồng nghiệp trước khi finalize');
      
      // Build comprehensive feedback message with details
      let feedbackDetails = '';
      
      // Separate critical and important weaknesses
      const criticalWeaknesses = weaknessesList.filter(w => w.includes('[CRITICAL]'));
      const importantWeaknesses = weaknessesList.filter(w => w.includes('[IMPORTANT]') && !w.includes('[CRITICAL]'));
      const otherWeaknesses = weaknessesList.filter(w => !w.includes('[CRITICAL]') && !w.includes('[IMPORTANT]'));
      
      if (criticalWeaknesses.length > 0) {
        feedbackDetails += `\n\n🚨 **VẤN ĐỀ CRITICAL CẦN ƯU TIÊN:**\n`;
        criticalWeaknesses.forEach(w => {
          feedbackDetails += `• ${w}\n`;
        });
      }
      
      if (importantWeaknesses.length > 0) {
        feedbackDetails += `\n⚠️ **ĐIỂM CẦN CẢI THIỆN QUAN TRỌNG:**\n`;
        importantWeaknesses.forEach(w => {
          feedbackDetails += `• ${w}\n`;
        });
      }
      
      let feedback = `Bài làm của bạn cho "${exerciseTitle}" được đánh giá ${
        score >= 85 ? '85+ - XUẤT SẮC ⭐⭐⭐' : 
        score >= 75 ? '75-84 - TỐT ⭐⭐' : 
        score >= 65 ? '65-74 - HỢP LỆ ⭐' : 
        score >= 50 ? '50-64 - CẦN CẢI THIỆN' :
        '< 50 - CHƯA ĐẠT YÊU CẦU'
      }.`;
      
      if (score >= 80) {
        feedback += `\n\nBài làm có chất lượng cao với phân tích chi tiết, toàn diện từ cả góc nhìn kỹ thuật lẫn kinh doanh.${feedbackDetails}`;
      } else if (score >= 70) {
        feedback += `\n\nBài làm có cơ sở tốt nhưng còn thiếu một số yếu tố quan trọng. Hãy tập trung hoàn thiện các điểm yếu.${feedbackDetails}`;
      } else if (score >= 60) {
        feedback += `\n\nBài làm chỉ đáp ứng tiêu chí cơ bản. Cần cải thiện đáng kể ở các lĩnh vực quan trọng để đạt tiêu chuẩn cao hơn.${feedbackDetails}`;
      } else {
        feedback += `\n\nBài làm cần được hoàn toàn viết lại với cấu trúc tốt hơn và phân tích sâu hơn về nhu cầu người dùng và kinh doanh.${feedbackDetails}`;
      }
      
      return { 
        score,
        feedback,
        strengths: strengthsList.slice(0, 6),
        weaknesses: weaknessesList.slice(0, 6),
        recommendations: recommendationsList
      };
    }
    
    // Use AI when available - more comprehensive prompt
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Comprehensive Evaluation for: "${exerciseTitle}"
      
Solution Content:
${solution}

SCORING CRITERIA (Critical factors):
1. User/Customer Understanding [CRITICAL - -20 if missing]
2. Business Perspective & ROI [CRITICAL - -20 if missing]
3. Metrics & Data [IMPORTANT - -12 if missing]
4. Implementation Plan [IMPORTANT - -12 if missing]
5. Risk Analysis [IMPORTANT - -10 if missing]
6. Competitive Analysis [HIGH - -8 if missing]
7. Timeline/Roadmap [HIGH - -8 if missing]
8. Examples & Clarity [MEDIUM - -5 if missing]

Score (0-100):
- 85+: Has all critical factors + quality execution
- 75-84: Most factors present, some gaps
- 65-74: Basic factors present, multiple gaps
- 50-64: Missing important factors
- <50: Missing critical factors

Provide 5-6 specific STRENGTHS with details.
Provide 5-6 specific WEAKNESSES, mark [CRITICAL] or [IMPORTANT] if necessary.
Provide 5-6 RECOMMENDATIONS prioritizing critical gaps.

Output as JSON.`,
      config: {
        systemInstruction: "Bạn là chuyên gia tư vấn cao cấp. Chấm điểm CÔNG BẰNG dựa trên Critical Factors. Nếu thiếu User Insight + Business Perspective = KHÔNG thể cao điểm. Score phải phản ánh thực tế chất lượng. Phản hồi tiếng Việt, dùng emoji ⭐ [CRITICAL] [IMPORTANT] để rõ ràng.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "strengths", "weaknesses", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { 
    return { 
      score: 0, 
      feedback: "Lỗi hệ thống khi đánh giá bài làm.", 
      strengths: [], 
      weaknesses: [], 
      recommendations: [] 
    }; 
  }
};

export const evaluateCVContent = async (cvContent: string): Promise<AIScoreResult> => {
  try {
    if (!ai) {
      // Extract skills from CV content when API not available
      const commonSkills = [
        'ReactJS', 'React', 'Vue', 'Angular', 'Node.js', 'Node', 'Python', 'JavaScript', 'TypeScript',
        'Tailwind', 'CSS', 'HTML', 'Java', 'C++', 'SQL', 'MongoDB', 'PostgreSQL',
        'AWS', 'GCP', 'Docker', 'Kubernetes', 'Git', 'UI/UX', 'Figma', 'Design',
        'Agile', 'Scrum', 'Leadership', 'Communication', 'Problem-solving'
      ];
      
      const cvLower = cvContent.toLowerCase();
      const foundSkills: string[] = [];
      
      commonSkills.forEach(skill => {
        if (cvLower.includes(skill.toLowerCase())) {
          foundSkills.push(skill);
        }
      });
      
      const skillScore = Math.min(foundSkills.length * 8, 100);
      const lengthBonus = cvContent.length > 500 ? 10 : cvContent.length > 300 ? 5 : 0;
      const finalScore = Math.min(skillScore + lengthBonus, 100);
      
      return { 
        score: finalScore,
        feedback: `CV của bạn có chất lượng ${finalScore > 80 ? 'xuất sắc' : finalScore > 60 ? 'tốt' : finalScore > 40 ? 'trung bình' : 'cần cải thiện'}. ` +
                  (foundSkills.length > 0 
                    ? `Tôi tìm thấy các kỹ năng: ${foundSkills.join(', ')}. `
                    : `Hãy thêm các kỹ năng cụ thể vào CV. `) +
                  `CV bạn hiện có độ dài ${cvContent.length} ký tự. ${finalScore < 70 ? 'Hãy bổ sung thêm kinh nghiệm và kỹ năng để nâng điểm.' : 'Tuyệt vời, bạn đã chuẩn bị đủ thông tin!'}`,
        recommendations: [
          foundSkills.length > 0 
            ? `Nhấn mạnh những kỹ năng mạnh: ${foundSkills.slice(0, 3).join(', ')}`
            : 'Thêm các kỹ năng kỹ thuật: ReactJS, NodeJS, Python, etc.',
          'Bổ sung các dự án thực tế và thành tích cụ thể',
          'Nêu rõ chứng chỉ, giải thưởng và kinh nghiệm làm việc'
        ] 
      };
    }
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate CV Quality:
${cvContent}

Please analyze:
1. Extract all skills and technologies mentioned
2. Assess overall CV quality (0-100)
3. Provide constructive feedback in Vietnamese`,
      config: {
        systemInstruction: "Bạn là một chuyên gia HR. Phân tích CV: (1) Liệt kê skills tìm thấy, (2) Cho điểm 0-100 dựa trên cấu trúc và nội dung, (3) Gợi ý cải thiện. Phản hồi bằng tiếng Việt.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["score", "feedback", "recommendations"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) { 
    return { score: 0, feedback: "Lỗi đánh giá CV", recommendations: [] }; 
  }
};
