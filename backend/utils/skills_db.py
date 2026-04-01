"""Common skills database for matching"""

SKILLS_DATABASE = [
    # Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
    
    # Web Technologies
    "React", "Angular", "Vue.js", "Node.js", "Express.js", "Next.js", "Nuxt.js",
    "HTML", "CSS", "SASS", "LESS", "Tailwind CSS", "Bootstrap", "jQuery",
    "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel",
    
    # Mobile Development
    "React Native", "Flutter", "iOS", "Android", "Xamarin", "Ionic",
    
    # Databases
    "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "SQL Server", "DynamoDB", "Cassandra", "Elasticsearch", "Firebase",
    
    # Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "GCP", "Docker", "Kubernetes", "Jenkins",
    "GitLab CI", "GitHub Actions", "Terraform", "Ansible", "CircleCI",
    "Travis CI", "Heroku", "Netlify", "Vercel",
    
    # Data Science & ML
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
    "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
    "Data Analysis", "Data Visualization", "NLP", "Computer Vision",
    "Neural Networks", "CNN", "RNN", "LSTM", "Transformers",
    
    # Tools & Platforms
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence",
    "Slack", "VS Code", "IntelliJ", "PyCharm", "Postman", "Figma",
    "Adobe XD", "Sketch", "Photoshop", "Illustrator",
    
    # Testing
    "Jest", "Mocha", "Pytest", "JUnit", "Selenium", "Cypress",
    "Unit Testing", "Integration Testing", "E2E Testing", "TDD", "BDD",
    
    # Methodologies
    "Agile", "Scrum", "Kanban", "Waterfall", "CI/CD", "DevOps",
    "Microservices", "REST API", "GraphQL", "gRPC", "WebSockets",
    
    # Soft Skills
    "Leadership", "Communication", "Problem Solving", "Team Work",
    "Project Management", "Time Management", "Critical Thinking",
    
    # Other Technologies
    "Linux", "Unix", "Windows", "macOS", "Bash", "PowerShell",
    "Nginx", "Apache", "Kafka", "RabbitMQ", "WebRTC", "OAuth",
    "JWT", "Blockchain", "Ethereum", "Solidity", "Web3",
]

def normalize_skill(skill: str) -> str:
    """Normalize skill name for comparison"""
    return skill.lower().strip()

def get_all_skills():
    """Get all skills from database"""
    return SKILLS_DATABASE

def find_skills_in_text(text: str) -> list:
    """Find all skills mentioned in text"""
    text_lower = text.lower()
    found_skills = []
    
    for skill in SKILLS_DATABASE:
        if normalize_skill(skill) in text_lower:
            found_skills.append(skill)
    
    return list(set(found_skills))  # Remove duplicates
