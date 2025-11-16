// Test Resume Builder API
const API_URL = 'http://localhost:5000/api';

// First, login to get token
async function login() {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
        })
    });
    
    if (!response.ok) {
        console.log('Login failed, trying to register...');
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
                full_name: 'Test User'
            })
        });
        
        if (!registerResponse.ok) {
            const errorText = await registerResponse.text();
            throw new Error(`Registration failed: ${errorText}`);
        }
        
        const registerData = await registerResponse.json();
        return registerData.token;
    }
    
    const data = await response.json();
    return data.token;
}

// Create a test resume
async function createResume(token) {
    const resume = {
        title: "Software Developer Resume",
        template: "modern",
        personal_info: {
            full_name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            location: "San Francisco, CA",
            website: "https://johndoe.dev",
            linkedin: "https://linkedin.com/in/johndoe",
            github: "https://github.com/johndoe"
        },
        summary: "Experienced full-stack developer with 5+ years of expertise in building scalable web applications. Proficient in React, Node.js, and cloud technologies. Passionate about clean code and user experience.",
        experience: [
            {
                position: "Senior Software Engineer",
                company: "Tech Corp",
                location: "San Francisco, CA",
                start_date: "Jan 2021",
                end_date: "Present",
                description: "Led development of microservices architecture serving 1M+ users. Mentored junior developers and improved code quality through comprehensive testing.",
                achievements: []
            },
            {
                position: "Software Developer",
                company: "StartupXYZ",
                location: "Remote",
                start_date: "Jun 2019",
                end_date: "Dec 2020",
                description: "Built RESTful APIs and React components for e-commerce platform. Reduced page load time by 40% through optimization.",
                achievements: []
            }
        ],
        education: [
            {
                degree: "Bachelor of Science",
                field: "Computer Science",
                institution: "University of California, Berkeley",
                start_date: "2015",
                end_date: "2019",
                gpa: "3.8"
            }
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "MongoDB", "PostgreSQL", "Git", "Agile"]
    };
    
    const response = await fetch(`${API_URL}/resumes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resume)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create resume: ${error}`);
    }
    
    return await response.json();
}

// Get all resumes
async function getResumes(token) {
    const response = await fetch(`${API_URL}/resumes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to get resumes');
    }
    
    return await response.json();
}

// Main test
async function test() {
    try {
        console.log('🔐 Logging in...');
        const token = await login();
        console.log('✅ Login successful!');
        
        console.log('\n📝 Creating test resume...');
        const newResume = await createResume(token);
        console.log('✅ Resume created successfully!');
        console.log('Resume ID:', newResume._id);
        console.log('Title:', newResume.title);
        console.log('Template:', newResume.template);
        console.log('Name:', newResume.personal_info.full_name);
        
        console.log('\n📋 Fetching all resumes...');
        const resumes = await getResumes(token);
        console.log(`✅ Found ${resumes.length} resume(s)`);
        
        resumes.forEach((resume, index) => {
            console.log(`\nResume ${index + 1}:`);
            console.log('  Title:', resume.title);
            console.log('  Name:', resume.personal_info.full_name);
            console.log('  Template:', resume.template);
            console.log('  Experience entries:', resume.experience.length);
            console.log('  Education entries:', resume.education.length);
            console.log('  Skills:', resume.skills.length);
        });
        
        console.log('\n✅ All tests passed!');
        console.log('\n🌐 Open http://localhost:3000 and navigate to Resume Builder to see the results!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

test();
