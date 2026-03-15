
import { User, Job, Application, ApplicationStatus, PracticeExercise, Notification, ExerciseResult } from '@/types';
import { evaluateCVAgainstJob, generateMarketData } from '@/services/geminiService';

const STORAGE_KEYS = {
  USERS: 'mt_db_users',
  JOBS: 'mt_db_jobs',
  APPLICATIONS: 'mt_db_applications',
  EXERCISES: 'mt_db_exercises',
  EXERCISE_RESULTS: 'mt_db_exercise_results',
  NOTIFICATIONS: 'mt_db_notifications',
  CURRENT_USER: 'mt_db_current_session'
};

class BackendService {
  private getStorage<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async initializeDatabase(): Promise<boolean> {
    const existingJobs = this.getJobs();
    
    // Update specific user name if they exist
    const users = this.getStorage<any[]>(STORAGE_KEYS.USERS, []);
    const huyenUser = users.find(u => u.email.toLowerCase() === 'gungmeme06@gmail.com');
    if (huyenUser && huyenUser.name !== 'Nguyễn Khánh Huyền') {
      huyenUser.name = 'Nguyễn Khánh Huyền';
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      // Also update current session if it's her
      const current = this.getCurrentUser();
      if (current && current.email.toLowerCase() === 'gungmeme06@gmail.com') {
        current.name = 'Nguyễn Khánh Huyền';
        this.setStorage(STORAGE_KEYS.CURRENT_USER, current);
      }
    }

    // Ensure technova@gmail.com exists as a business user for TechNova Global
    const technovaUser = users.find(u => u.email.toLowerCase() === 'technova@gmail.com');
    if (!technovaUser) {
      const newTechnova: User = {
        id: 'c_technova',
        email: 'technova@gmail.com',
        name: 'TechNova Global',
        role: 'business',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaEGIiELh660Lm_HzrseIe11KUOyr_riTO-NuyflYTy3P0lbQcNnKrzu7wBnRDcg9Z7jt5-qeCK9EXrF09FYJgMegUQOMDtASqcijHQj-Sv-geeb-aOZvnWH00x-r4ZYS5wsjI5hGMR14n-xEluadcsy_kilM0e0_iyaJ6z_bqFcR38RaNcdLQMXb01TYp58wT3tRC68M6jjJa6eJvjy47UFY70zi7Bx_7UEQKxZr7LxcDBUDV_aKZuk5BjsVb-F4SQBj9y0mWJMc',
        subscriptionTier: 'FREE',
        monthlyPostLimit: 3,
        postsRemaining: 2,
        lastResetDate: new Date().toISOString()
      };
      users.push(newTechnova);
      this.setStorage(STORAGE_KEYS.USERS, users);
    } else {
      // Force update for demo if it's currently 3
      if (technovaUser.postsRemaining === 3) {
        technovaUser.postsRemaining = 2;
        this.setStorage(STORAGE_KEYS.USERS, users);
        
        // Also update current session if it's them
        const current = this.getCurrentUser();
        if (current && current.email.toLowerCase() === 'technova@gmail.com') {
          current.postsRemaining = 2;
          this.setStorage(STORAGE_KEYS.CURRENT_USER, current);
        }
      }
    }
    
    if (technovaUser && technovaUser.id !== 'c_technova') {
      const oldId = technovaUser.id;
      technovaUser.id = 'c_technova';
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      // Migrate old jobs and apps if ID changed
      const jobs = this.getStorage<Job[]>(STORAGE_KEYS.JOBS, []);
      let jobsChanged = false;
      jobs.forEach(j => {
        if (j.companyId === oldId) {
          j.companyId = 'c_technova';
          jobsChanged = true;
        }
      });
      if (jobsChanged) this.setStorage(STORAGE_KEYS.JOBS, jobs);

      const apps = this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
      let appsChanged = false;
      // Note: apps don't have companyId directly, but they are linked to jobs
      // If jobs are updated, apps will still point to the same jobId, so it's fine.
    }

    // Seed TechNova jobs if they don't exist
    const currentJobs = this.getJobs();
    const hasTechNovaJobs = currentJobs.some(j => j.companyId === 'c_technova');
    if (!hasTechNovaJobs) {
      const hardcodedJobs: Job[] = [
        {
          id: 'job_technova_1',
          companyId: 'c_technova',
          companyName: 'TechNova Global',
          title: 'Senior Product Designer',
          description: 'Chúng tôi đang tìm kiếm một Senior Product Designer tài năng để dẫn dắt các dự án thiết kế sản phẩm đột phá.',
          requirements: ['5+ năm kinh nghiệm', 'Thành thạo Figma', 'Kỹ năng tư duy sản phẩm tốt'],
          location: 'Hà Nội',
          salary: '35 - 50 Triệu VNĐ',
          category: 'Design',
          deadline: '20/03/2026',
          postedDate: '01/02/2026',
          tag: 'HOT',
          isHot: true,
          testAssignment: 'Thiết kế luồng trải nghiệm cho tính năng Dashboard quản lý tài chính cá nhân.'
        },
        {
          id: 'job_technova_2',
          companyId: 'c_technova',
          companyName: 'TechNova Global',
          title: 'Backend Engineer (Node.js)',
          description: 'Tham gia xây dựng hệ thống backend quy mô lớn, hiệu năng cao cho các sản phẩm Fintech.',
          requirements: ['3+ năm kinh nghiệm Node.js', 'Hiểu biết về Microservices', 'Kỹ năng tối ưu hóa Database'],
          location: 'TP. Hồ Chí Minh',
          salary: '30 - 45 Triệu VNĐ',
          category: 'Engineering',
          deadline: '25/03/2026',
          postedDate: '05/02/2026',
          tag: 'PRO',
          testAssignment: 'Xây dựng API cho tính năng chuyển tiền thời gian thực với cơ chế retry và idempotency.'
        }
      ];
      this.setStorage(STORAGE_KEYS.JOBS, [...currentJobs, ...hardcodedJobs]);
    }

    // Seed mock applications for TechNova if they don't exist
    const existingApps = this.getApplications();
    const hasTechNovaApps = existingApps.some(a => a.jobId.startsWith('job_technova'));
    
    if (!hasTechNovaApps) {
      const mockApps: Application[] = [
        {
          id: 'app_mock_1',
          jobId: 'job_technova_1',
          studentId: 'u_gungmeme06',
          cvFileName: 'Nguyen_Khanh_Huyen_CV.pdf',
          cvContent: 'Kinh nghiệm thiết kế sản phẩm tại TechNova...',
          cvScore: 92,
          aiFeedback: 'Ứng viên xuất sắc với tư duy sản phẩm tốt.',
          status: 'HIRED',
          appliedDate: '15/02/2026'
        },
        {
          id: 'app_mock_2',
          jobId: 'job_technova_1',
          studentId: 'u_mock_2',
          cvFileName: 'Tran_Van_A_CV.pdf',
          cvContent: 'Designer 3 năm kinh nghiệm...',
          cvScore: 78,
          aiFeedback: 'Kỹ năng UI tốt nhưng cần cải thiện UX Research.',
          status: 'CV_PASSED',
          appliedDate: '16/02/2026'
        },
        {
          id: 'app_mock_3',
          jobId: 'job_technova_2',
          studentId: 'u_mock_3',
          cvFileName: 'Le_Thi_B_CV.pdf',
          cvContent: 'Backend Developer Node.js...',
          cvScore: 85,
          aiFeedback: 'Kiến thức vững về Node.js và Microservices.',
          status: 'TEST_SUBMITTED',
          appliedDate: '17/02/2026'
        }
      ];
      
      // Ensure mock users exist
      if (!users.find(u => u.id === 'u_mock_2')) {
        users.push({ id: 'u_mock_2', email: 'mock2@example.com', name: 'Trần Văn A', role: 'student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' });
      }
      if (!users.find(u => u.id === 'u_mock_3')) {
        users.push({ id: 'u_mock_3', email: 'mock3@example.com', name: 'Lê Thị B', role: 'student', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' });
      }
      this.setStorage(STORAGE_KEYS.USERS, users);
      this.setStorage(STORAGE_KEYS.APPLICATIONS, [...existingApps, ...mockApps]);
    }

    // Force refresh exercises if stale
    this.getExercises();

    if (existingJobs.length > 0) {
      // Even if jobs exist, we might need to seed TechNova specific data if missing
      const hasTechNovaJobs = existingJobs.some(j => j.companyId === 'c_technova');
      if (!hasTechNovaJobs) {
        const hardcodedJobs: Job[] = [
          {
            id: 'job_technova_1',
            companyId: 'c_technova',
            companyName: 'TechNova Global',
            title: 'Senior Product Designer',
            description: 'Chúng tôi đang tìm kiếm một Senior Product Designer tài năng để dẫn dắt các dự án thiết kế sản phẩm đột phá.',
            requirements: ['5+ năm kinh nghiệm', 'Thành thạo Figma', 'Kỹ năng tư duy sản phẩm tốt'],
            location: 'Hà Nội',
            salary: '35 - 50 Triệu VNĐ',
            category: 'Design',
            deadline: '20/03/2026',
            postedDate: '01/02/2026',
            tag: 'HOT',
            isHot: true,
            testAssignment: 'Thiết kế luồng trải nghiệm cho tính năng Dashboard quản lý tài chính cá nhân.'
          },
          {
            id: 'job_technova_2',
            companyId: 'c_technova',
            companyName: 'TechNova Global',
            title: 'Backend Engineer (Node.js)',
            description: 'Tham gia xây dựng hệ thống backend quy mô lớn, hiệu năng cao cho các sản phẩm Fintech.',
            requirements: ['3+ năm kinh nghiệm Node.js', 'Hiểu biết về Microservices', 'Kỹ năng tối ưu hóa Database'],
            location: 'TP. Hồ Chí Minh',
            salary: '30 - 45 Triệu VNĐ',
            category: 'Engineering',
            deadline: '25/03/2026',
            postedDate: '05/02/2026',
            tag: 'PRO',
            testAssignment: 'Xây dựng API cho tính năng chuyển tiền thời gian thực với cơ chế retry và idempotency.'
          }
        ];
        this.setStorage(STORAGE_KEYS.JOBS, [...existingJobs, ...hardcodedJobs]);
      }
      return false;
    }

    const { jobs, exercises } = await generateMarketData();
    
    // Add hardcoded jobs to ensure they exist in the database
    const hardcodedJobs: Job[] = [
      {
        id: 'job_technova_1',
        companyId: 'c_technova',
        companyName: 'TechNova Global',
        title: 'Senior Product Designer',
        description: 'Chúng tôi đang tìm kiếm một Senior Product Designer tài năng để dẫn dắt các dự án thiết kế sản phẩm đột phá.',
        requirements: ['5+ năm kinh nghiệm', 'Thành thạo Figma', 'Kỹ năng tư duy sản phẩm tốt'],
        location: 'Hà Nội',
        salary: '35 - 50 Triệu VNĐ',
        category: 'Design',
        deadline: '20/03/2026',
        postedDate: '01/02/2026',
        tag: 'HOT',
        isHot: true,
        testAssignment: 'Thiết kế luồng trải nghiệm cho tính năng Dashboard quản lý tài chính cá nhân.'
      },
      {
        id: 'job_technova_2',
        companyId: 'c_technova',
        companyName: 'TechNova Global',
        title: 'Backend Engineer (Node.js)',
        description: 'Tham gia xây dựng hệ thống backend quy mô lớn, hiệu năng cao cho các sản phẩm Fintech.',
        requirements: ['3+ năm kinh nghiệm Node.js', 'Hiểu biết về Microservices', 'Kỹ năng tối ưu hóa Database'],
        location: 'TP. Hồ Chí Minh',
        salary: '30 - 45 Triệu VNĐ',
        category: 'Engineering',
        deadline: '25/03/2026',
        postedDate: '05/02/2026',
        tag: 'PRO',
        testAssignment: 'Xây dựng API cho tính năng chuyển tiền thời gian thực với cơ chế retry và idempotency.'
      },
      {
        id: 'job_japanese',
        companyId: 'c_concentrix',
        companyName: 'Concentrix Services Vietnam',
        title: 'Chăm Sóc Khách Hàng Tiếng Nhật (N1/N2)',
        description: 'Chào đón bạn gia nhập đại gia đình Concentrix! Với vị trí Chăm sóc khách hàng tiếng Nhật, bạn sẽ là gương mặt đại diện kết nối thương hiệu với người dùng tại thị trường Nhật Bản.',
        requirements: ['N1/N2 Japanese', 'Customer Service skills'],
        location: 'TP. Hồ Chí Minh',
        salary: '23.2 Triệu VNĐ',
        category: 'Business',
        deadline: '31/12/2026',
        postedDate: '10/02/2026',
        tag: 'HOT',
        isHot: true
      },
      {
        id: 'job_music',
        companyId: 'c_fpt_edu',
        companyName: 'Hệ thống giáo dục FPT',
        title: 'Giảng Viên Âm Nhạc - FSC LA',
        description: 'Chúng tôi đang tìm kiếm Giảng viên Âm nhạc nhiệt huyết để tham gia vào đội ngũ giáo dục tại phân hiệu Tây Ninh (FSC LA).',
        requirements: ['Đại học chuyên ngành Âm nhạc', 'Kỹ năng sư phạm'],
        location: 'Tây Ninh',
        salary: 'Thỏa thuận',
        category: 'Design',
        deadline: '2026',
        postedDate: '15/02/2026',
        tag: 'PRO'
      }
    ];

    const momoExercise: PracticeExercise = {
      id: 'momo-1',
      company: 'Momo E-Wallet',
      title: 'Tăng tỷ lệ chuyển đổi nạp tiền điện thoại',
      description: 'Cải thiện UI/UX của tính năng top-up để giảm thiểu số bước thao tác và tăng trải nghiệm người dùng.',
      tag: 'Product Design',
      time: '30 phút',
      difficulty: 'TRUNG BÌNH',
      diffColor: 'orange',
      category: 'Design'
    };

    const allJobs = [...hardcodedJobs, ...jobs];
    const allExercises = [momoExercise, ...exercises];

    if (allJobs.length > 0) {
      this.setStorage(STORAGE_KEYS.JOBS, allJobs);
      this.setStorage(STORAGE_KEYS.EXERCISES, allExercises);
      
      // Seed a mock result for the Momo exercise if a user exists
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.saveExerciseResult({
          exerciseId: 'momo-1',
          studentId: currentUser.id,
          score: 88,
          feedback: "Giải pháp thiết kế rất tốt, tập trung vào trải nghiệm người dùng thực tế.",
          strengths: ["Giao diện trực quan", "Giảm thiểu bước thao tác", "Sử dụng màu sắc hợp lý"],
          weaknesses: ["Cần thêm các micro-interactions"],
          recommendations: ["Nghiên cứu thêm về hành vi người dùng Gen Z"],
          completedDate: new Date().toLocaleDateString('vi-VN')
        });
      }
      
      return true;
    }
    return false;
  }

  login(email: string, role: 'student' | 'business', password?: string): User | null {
    const users = this.getStorage<any[]>(STORAGE_KEYS.USERS, []);
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);

    if (!user) {
      // For demo purposes, if it's the specific email, create it with the requested name
      if (email.toLowerCase() === 'gungmeme06@gmail.com' && role === 'student') {
        user = {
          id: 'u_gungmeme06',
          email: 'gungmeme06@gmail.com',
          name: 'Nguyễn Khánh Huyền',
          role: 'student',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Huyen',
          skills: ['Analysis', 'Strategy'],
          subscriptionTier: 'FREE'
        };
        users.push(user);
        this.setStorage(STORAGE_KEYS.USERS, users);
      } else {
        return null;
      }
    } else if (email.toLowerCase() === 'gungmeme06@gmail.com' && user.name !== 'Nguyễn Khánh Huyền') {
      // Update name if it's the specific user but has old name
      user.name = 'Nguyễn Khánh Huyền';
      const idx = users.findIndex(u => u.id === user.id);
      users[idx] = user;
      this.setStorage(STORAGE_KEYS.USERS, users);
    }

    // If password is provided, check it (simple mock check)
    if (password && user.password && user.password !== password) {
      return null;
    }

    this.setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }

  register(userData: { email: string; name: string; role: 'student' | 'business'; password?: string }): User {
    const users = this.getStorage<any[]>(STORAGE_KEYS.USERS, []);
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase() && u.role === userData.role);
    if (existing) {
      // Update password and name if registering again
      existing.password = userData.password;
      existing.name = userData.name;
      const idx = users.findIndex(u => u.id === existing.id);
      users[idx] = existing;
      this.setStorage(STORAGE_KEYS.USERS, users);
      // Auto-login the user
      this.setStorage(STORAGE_KEYS.CURRENT_USER, existing);
      return existing;
    }

    const newUser: any = {
      id: `u_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      password: userData.password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      skills: [], // Start with empty skills
      subscriptionTier: 'FREE',
      monthlyPostLimit: userData.role === 'business' ? 3 : undefined,
      postsRemaining: userData.role === 'business' ? 3 : undefined,
      lastResetDate: userData.role === 'business' ? new Date().toISOString() : undefined
    };

    users.push(newUser);
    this.setStorage(STORAGE_KEYS.USERS, users);
    // Auto-login the user after successful registration
    this.setStorage(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  }

  updateUserSkills(userId: string, newSkills: string[]) {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const currentSkills = users[index].skills || [];
      const combined = Array.from(new Set([...currentSkills, ...newSkills]));
      users[index].skills = combined;
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      // Update current session if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.setStorage(STORAGE_KEYS.CURRENT_USER, users[index]);
      }
    }
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  upgradeUser(userId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', duration: number): User | null {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + duration);

    const updatedUser = { 
      ...users[index], 
      subscriptionTier: tier,
      subscriptionExpiry: expiry.toISOString(),
      // For business users, update limits
      monthlyPostLimit: tier === 'BASIC' ? 10 : tier === 'PRO' ? 50 : 999,
      postsRemaining: tier === 'BASIC' ? 10 : tier === 'PRO' ? 50 : 999
    };
    
    users[index] = updatedUser;
    this.setStorage(STORAGE_KEYS.USERS, users);
    
    // Update current session if it's the same user
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setStorage(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }
    
    return updatedUser;
  }

  getCurrentUser(): User | null {
    return this.getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  getJobs(): Job[] {
    let jobs = this.getStorage<Job[]>(STORAGE_KEYS.JOBS, []);
    const now = new Date();
    let needsUpdate = false;

    // Auto-expire jobs
    jobs = jobs.map(job => {
      if (job.tag !== 'CLOSED' && job.deadline) {
        let deadlineDate: Date | null = null;
        if (job.deadline.includes('-')) {
          deadlineDate = new Date(job.deadline);
        } else if (job.deadline.includes('/')) {
          const parts = job.deadline.split('/');
          if (parts.length === 3) {
            const [d, m, y] = parts.map(Number);
            deadlineDate = new Date(y, m - 1, d, 23, 59, 59);
          }
        } else if (/^\d{4}$/.test(job.deadline)) {
          deadlineDate = new Date(Number(job.deadline), 11, 31, 23, 59, 59);
        }

        if (deadlineDate && !isNaN(deadlineDate.getTime()) && deadlineDate < now) {
          needsUpdate = true;
          return { ...job, tag: 'CLOSED' };
        }
      }
      return job;
    });

    if (needsUpdate) {
      this.setStorage(STORAGE_KEYS.JOBS, jobs);
    }
    
    // Ensure hardcoded jobs exist for the demo
    const hasJapanese = jobs.some(j => j.id === 'job_japanese');
    const hasMusic = jobs.some(j => j.id === 'job_music');
    
    if (!hasJapanese || !hasMusic) {
      const hardcodedJobs: Job[] = [
        {
          id: 'job_japanese',
          companyId: 'c_concentrix',
          companyName: 'Concentrix Services Vietnam',
          title: 'Chăm Sóc Khách Hàng Tiếng Nhật (N1/N2)',
          description: 'Chào đón bạn gia nhập đại gia đình Concentrix! Với vị trí Chăm sóc khách hàng tiếng Nhật, bạn sẽ là gương mặt đại diện kết nối thương hiệu với người dùng tại thị trường Nhật Bản.',
          requirements: ['N1/N2 Japanese', 'Customer Service skills'],
          location: 'TP. Hồ Chí Minh',
          salary: '23.2 Triệu VNĐ',
          category: 'Business',
          deadline: '31/12/2026',
          postedDate: '10/02/2026',
          tag: 'HOT',
          isHot: true
        },
        {
          id: 'job_music',
          companyId: 'c_fpt_edu',
          companyName: 'Hệ thống giáo dục FPT',
          title: 'Giảng Viên Âm Nhạc - FSC LA',
          description: 'Chúng tôi đang tìm kiếm Giảng viên Âm nhạc nhiệt huyết để tham gia vào đội ngũ giáo dục tại phân hiệu Tây Ninh (FSC LA).',
          requirements: ['Đại học chuyên ngành Âm nhạc', 'Kỹ năng sư phạm'],
          location: 'Tây Ninh',
          salary: 'Thỏa thuận',
          category: 'Design',
          deadline: '2026',
          postedDate: '15/02/2026',
          tag: 'PRO'
        }
      ];
      
      const updatedJobs = [...jobs];
      if (!hasJapanese) updatedJobs.push(hardcodedJobs[0]);
      if (!hasMusic) updatedJobs.push(hardcodedJobs[1]);
      
      this.setStorage(STORAGE_KEYS.JOBS, updatedJobs);
      return updatedJobs;
    }
    
    return jobs;
  }

  getApplicationsByStudent(studentId: string): Application[] {
    const apps = this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    return apps.filter(a => a.studentId === studentId);
  }

  getStudentStats(studentId: string) {
    const allApps = this.getApplicationsByStudent(studentId);
    
    // Filter to latest per job
    const latestAppsMap = new Map<string, Application>();
    allApps.forEach(app => {
      const existing = latestAppsMap.get(app.jobId);
      if (!existing || app.id > existing.id) {
        latestAppsMap.set(app.jobId, app);
      }
    });
    
    const apps = Array.from(latestAppsMap.values());
    const passedCount = apps.filter(a => a.status === 'CV_PASSED' || a.status === 'HIRED' || a.status === 'TEST_SUBMITTED').length;
    const interviewCount = apps.filter(a => a.status === 'INTERVIEW_CONFIRMED').length;
    const avgScore = apps.length > 0 
      ? Math.round(apps.reduce((acc, curr) => acc + curr.cvScore, 0) / apps.length) 
      : 0;

    return {
      totalApplications: apps.length,
      passedCount,
      interviewCount,
      avgScore,
      recentApps: apps.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 3)
    };
  }

  getExercises(): PracticeExercise[] {
    const exercises = this.getStorage<PracticeExercise[]>(STORAGE_KEYS.EXERCISES, []);
    const hasMomo = exercises.some(ex => ex.id === 'momo-1');
    // Check if any momo exercise is missing assumption or has old company name
    const isStale = exercises.some(ex => 
      ex.id.startsWith('momo-') && (!ex.assumption || ex.company === 'Momo E-Wallet' || ex.tag === 'Fullstack Dev' || ex.isPremium === undefined)
    );
    
    if (!hasMomo || exercises.length < 6 || isStale) {
      const momoExercises: PracticeExercise[] = [
        {
          id: 'momo-1',
          company: 'Mindtrace',
          assumption: 'Công ty MoMo E-Wallet',
          title: 'Tăng tỷ lệ chuyển đổi nạp tiền điện thoại',
          description: 'Cải thiện UI/UX của tính năng top-up để giảm thiểu số bước thao tác và tăng trải nghiệm người dùng.',
          tag: 'UI/UX Design',
          time: '24h',
          difficulty: 'TRUNG BÌNH',
          diffColor: 'orange',
          category: 'Design',
          isPremium: false
        },
        {
          id: 'momo-2',
          company: 'Mindtrace',
          assumption: 'Công ty VNPay',
          title: 'Tối ưu hóa quy trình thanh toán QR Code',
          description: 'Phân tích và đề xuất giải pháp kỹ thuật để giảm độ trễ khi quét mã QR trong điều kiện ánh sáng yếu.',
          tag: 'Backend Engineering',
          time: '24h',
          difficulty: 'KHÓ',
          diffColor: 'red',
          category: 'Engineering',
          isPremium: true
        },
        {
          id: 'momo-3',
          company: 'Mindtrace',
          assumption: 'Công ty Grab Vietnam',
          title: 'Chiến dịch Marketing cho Ví Trả Sau',
          description: 'Xây dựng kế hoạch truyền thông tích hợp để tăng số lượng người dùng kích hoạt Ví Trả Sau trong quý 2.',
          tag: 'Growth Marketing',
          time: '24h',
          difficulty: 'TRUNG BÌNH',
          diffColor: 'orange',
          category: 'Marketing',
          isPremium: true
        },
        {
          id: 'momo-4',
          company: 'Mindtrace',
          assumption: 'Ngân hàng Techcombank',
          title: 'Hệ thống phát hiện gian lận giao dịch',
          description: 'Thiết kế mô hình logic để nhận diện các giao dịch đáng ngờ dựa trên hành vi người dùng và vị trí địa lý.',
          tag: 'Data Science',
          time: '24h',
          difficulty: 'KHÓ',
          diffColor: 'red',
          category: 'IT',
          isPremium: true
        },
        {
          id: 'momo-5',
          company: 'Mindtrace',
          assumption: 'Ngân hàng MB Bank',
          title: 'Cải thiện luồng xác thực danh tính (eKYC)',
          description: 'Đề xuất các bước tối ưu trong quy trình eKYC để tăng tỷ lệ xác thực thành công ngay lần đầu tiên.',
          tag: 'Product Management',
          time: '24h',
          difficulty: 'TRUNG BÌNH',
          diffColor: 'orange',
          category: 'Business',
          isPremium: false
        },
        {
          id: 'momo-6',
          company: 'Mindtrace',
          assumption: 'Tập đoàn Viettel',
          title: 'Thiết kế hệ thống nhắc hẹn thanh toán hóa đơn',
          description: 'Xây dựng cơ chế thông báo thông minh giúp người dùng không bỏ lỡ hạn thanh toán điện, nước, internet.',
          tag: 'Fullstack Development',
          time: '24h',
          difficulty: 'DỄ',
          diffColor: 'emerald',
          category: 'IT',
          isPremium: false
        }
      ];
      
      const otherExercises = exercises.filter(ex => !ex.id.startsWith('momo-'));
      const updatedExercises = [...momoExercises, ...otherExercises];
      
      this.setStorage(STORAGE_KEYS.EXERCISES, updatedExercises);
      return updatedExercises;
    }
    
    return exercises;
  }

  saveExerciseResult(result: ExerciseResult) {
    const results = this.getStorage<ExerciseResult[]>(STORAGE_KEYS.EXERCISE_RESULTS, []);
    // Update existing result or add new one
    const index = results.findIndex(r => r.exerciseId === result.exerciseId && r.studentId === result.studentId);
    if (index !== -1) {
      results[index] = result;
    } else {
      results.push(result);
    }
    this.setStorage(STORAGE_KEYS.EXERCISE_RESULTS, results);
  }

  getExerciseResults(studentId: string): ExerciseResult[] {
    const results = this.getStorage<ExerciseResult[]>(STORAGE_KEYS.EXERCISE_RESULTS, []);
    
    // For demo purposes, if Momo result is missing, add it
    const hasMomoResult = results.some(r => r.exerciseId === 'momo-1' && r.studentId === studentId);
    if (!hasMomoResult) {
      const mockResult: ExerciseResult = {
        exerciseId: 'momo-1',
        studentId: studentId,
        score: 88,
        feedback: "Giải pháp thiết kế rất tốt, tập trung vào trải nghiệm người dùng thực tế.",
        strengths: ["Giao diện trực quan", "Giảm thiểu bước thao tác", "Sử dụng màu sắc hợp lý"],
        weaknesses: ["Cần thêm các micro-interactions"],
        recommendations: ["Nghiên cứu thêm về hành vi người dùng Gen Z"],
        completedDate: new Date().toLocaleDateString('vi-VN')
      };
      results.push(mockResult);
      this.setStorage(STORAGE_KEYS.EXERCISE_RESULTS, results);
    }
    
    return results.filter(r => r.studentId === studentId);
  }

  createJob(jobData: Partial<Job>): Job {
    const jobs = this.getStorage<Job[]>(STORAGE_KEYS.JOBS, []);
    const newJob: Job = {
      id: `job_${Date.now()}`,
      companyId: jobData.companyId || 'c_default',
      companyName: jobData.companyName || 'Unknown Company',
      title: jobData.title || 'Untitled Position',
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      location: jobData.location || 'Remote',
      salary: jobData.salary || 'Thỏa thuận',
      category: jobData.category || 'Business',
      deadline: jobData.deadline || '',
      tag: jobData.tag || 'PRO',
      benefits: jobData.benefits || '',
      testAssignment: jobData.testAssignment || '',
      minScore: jobData.minScore || 75,
      isHot: jobData.isHot || false,
      postedDate: new Date().toLocaleDateString('vi-VN')
    };
    jobs.unshift(newJob);
    this.setStorage(STORAGE_KEYS.JOBS, jobs);
    return newJob;
  }

  updateJob(jobId: string, jobData: Partial<Job>): Job | null {
    const jobs = this.getStorage<Job[]>(STORAGE_KEYS.JOBS, []);
    const index = jobs.findIndex(j => j.id === jobId);
    if (index === -1) return null;

    const updatedJob = { ...jobs[index], ...jobData };
    jobs[index] = updatedJob;
    this.setStorage(STORAGE_KEYS.JOBS, jobs);
    return updatedJob;
  }

  async createApplication(studentId: string, jobId: string, cvContent: string, cvFileName: string): Promise<Application> {
    const apps = this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const jobs = this.getJobs();
    const job = jobs.find(j => j.id === jobId);
    
    // Evaluate CV using AI
    const evaluation = await evaluateCVAgainstJob(
      cvContent, 
      job?.title || "Unknown", 
      job?.description || "",
      job?.requirements || []
    );
    const minScore = job?.minScore || 70;
    
    const newApp: Application = {
      id: `app_${Date.now()}`,
      jobId,
      studentId,
      cvFileName,
      cvContent,
      cvScore: evaluation.score,
      aiFeedback: evaluation.feedback,
      status: evaluation.score >= minScore ? 'CV_PASSED' : 'CV_REJECTED',
      appliedDate: new Date().toLocaleDateString('vi-VN'),
      testStartTime: evaluation.score >= minScore ? new Date().toISOString() : undefined
    };

    apps.push(newApp);
    this.setStorage(STORAGE_KEYS.APPLICATIONS, apps);
    
    this.addNotification(
      studentId, 
      'Ứng tuyển thành công', 
      `Bạn đã nộp hồ sơ cho vị trí ${job?.title || 'việc làm'}. Điểm CV: ${evaluation.score}/100`,
      evaluation.score >= 70 ? 'success' : 'info'
    );

    return newApp;
  }

  updateApplication(appId: string, appData: Partial<Application>): Application | null {
    const apps = this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
    const index = apps.findIndex(a => a.id === appId);
    if (index === -1) return null;

    const updatedApp = { ...apps[index], ...appData };
    apps[index] = updatedApp;
    this.setStorage(STORAGE_KEYS.APPLICATIONS, apps);
    return updatedApp;
  }

  addNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') {
    const all = this.getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId,
      title,
      message,
      time: 'Vừa xong',
      isRead: false,
      type
    };
    all.unshift(newNotif);
    this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
  }

  getNotifications(userId: string): Notification[] {
    const all = this.getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter(n => n.userId === userId);
  }

  getApplications(): Application[] {
    return this.getStorage<Application[]>(STORAGE_KEYS.APPLICATIONS, []);
  }

  getUserById(userId: string): User | null {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    return users.find(u => u.id === userId) || null;
  }

  markNotificationAsRead(notifId: string) {
    const all = this.getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const index = all.findIndex(n => n.id === notifId);
    if (index !== -1) {
      all[index].isRead = true;
      this.setStorage(STORAGE_KEYS.NOTIFICATIONS, all);
    }
  }

  canPostJob(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user || user.role !== 'business') return false;
    
    // Check if it's a new month and we need to reset
    const now = new Date();
    const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : null;
    
    if (lastReset && (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear())) {
      this.resetMonthlyLimits(userId);
      return true;
    }

    if (user.subscriptionTier !== 'FREE') return true; // Paid tiers have unlimited posts for this demo
    return (user.postsRemaining || 0) > 0;
  }

  decrementPostLimit(userId: string) {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1 && users[index].subscriptionTier === 'FREE') {
      users[index].postsRemaining = Math.max(0, (users[index].postsRemaining || 0) - 1);
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setStorage(STORAGE_KEYS.CURRENT_USER, users[index]);
      }
    }
  }

  resetMonthlyLimits(userId: string) {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].postsRemaining = users[index].monthlyPostLimit || 3;
      users[index].lastResetDate = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setStorage(STORAGE_KEYS.CURRENT_USER, users[index]);
      }
    }
  }

  upgradeSubscription(userId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', durationMonths: number) {
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + durationMonths);
      
      users[index].subscriptionTier = tier;
      users[index].subscriptionExpiry = expiry.toISOString();
      this.setStorage(STORAGE_KEYS.USERS, users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setStorage(STORAGE_KEYS.CURRENT_USER, users[index]);
      }
      
      this.addNotification(
        userId,
        'Nâng cấp gói thành công',
        `Bạn đã nâng cấp lên gói ${tier} thành công. Thời hạn đến ${expiry.toLocaleDateString('vi-VN')}.`,
        'success'
      );
    }
  }
}

export const backend = new BackendService();
