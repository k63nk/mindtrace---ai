
export type Role = 'student' | 'business';
export type ApplicationStatus = 'APPLIED' | 'CV_PASSED' | 'CV_REJECTED' | 'TEST_SUBMITTED' | 'PASSED_TEST' | 'HIRED' | 'FAILED' | 'INTERVIEW_CONFIRMED' | 'INTERVIEW_REJECTED';
export type JobCategory = 'IT' | 'Marketing' | 'Finance' | 'Design' | 'Business' | 'Engineering';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  skills?: string[];
  // Subscription fields for business users
  subscriptionTier?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  monthlyPostLimit?: number;
  postsRemaining?: number;
  subscriptionExpiry?: string;
  lastResetDate?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  location: string;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary: string;
  category: JobCategory;
  deadline: string;
  tag: string;
  postedDate?: string;
  isHot?: boolean;
  benefits?: string;
  testAssignment?: string;
  minScore?: number;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  cvFileName: string;
  cvContent: string;
  cvScore: number;
  aiFeedback: string;
  status: ApplicationStatus;
  appliedDate: string;
  testStartTime?: string;
  draftSolution?: string;
  testSubmission?: string;
  testScore?: number;
  companyScore?: number;
  companyFeedback?: string;
  interviewSlots?: string[];
  interviewLocation?: string;
  selectedInterviewSlot?: string;
}

export interface ExerciseObjective {
  title: string;
  description: string;
  icon?: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  company: string;
  assumption?: string;
  description: string;
  detailedDescription?: string;
  objectives?: ExerciseObjective[];
  tag: string;
  time: string;
  difficulty: 'DỄ' | 'TRUNG BÌNH' | 'KHÓ';
  diffColor: 'emerald' | 'orange' | 'red';
  category: JobCategory;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface AIScoreResult {
  score: number;
  feedback: string;
  recommendations: string[];
}

export interface ExerciseResult {
  exerciseId: string;
  studentId: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  completedDate: string;
}
