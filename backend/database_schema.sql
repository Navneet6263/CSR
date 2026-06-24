-- 1. Run this first to create the Database
-- CREATE DATABASE ScholarshipDB;
-- GO
-- USE ScholarshipDB;
-- GO

-- 2. Create Tables in exact dependency order

CREATE TABLE Sponsors (
    SponsorID INT IDENTITY(1,1) PRIMARY KEY,
    SponsorName NVARCHAR(150) NOT NULL,
    ContactPerson NVARCHAR(150) NOT NULL,
    Email NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    TotalFund DECIMAL(15,2) NOT NULL,
    FundAllocated DECIMAL(15,2) NOT NULL,
    FundUtilized DECIMAL(15,2) NOT NULL,
    ApprovalPolicy NVARCHAR(20) CHECK (ApprovalPolicy IN ('Auto', 'Manual')) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active' NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Institutions (
    InstitutionID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    District NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    Address NVARCHAR(MAX) NOT NULL,
    BankAccountNo NVARCHAR(50) NOT NULL,
    BankIFSC NVARCHAR(20) NOT NULL,
    IsVerified BIT DEFAULT 0 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(200) NOT NULL UNIQUE,
    Phone NVARCHAR(20),
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(30) NOT NULL CHECK (Role IN ('Student', 'Agent', 'DocReviewer', 'BGCheckOfficer', 'ScreeningOfficer', 'CSRPartner', 'Admin', 'Finance')),
    AgentCode NVARCHAR(20) UNIQUE,
    SponsorID INT NULL FOREIGN KEY REFERENCES Sponsors(SponsorID) ON DELETE SET NULL,
    IsActive BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Agents (
    AgentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    AgentCode NVARCHAR(20) NOT NULL UNIQUE,
    Region NVARCHAR(100) NOT NULL,
    CommissionRate DECIMAL(5,2) NOT NULL,
    TotalCommission DECIMAL(15,2) DEFAULT 0 NOT NULL,
    IsActive BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Students (
    StudentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    AadharNumber NVARCHAR(20),
    DOB DATE,
    Gender NVARCHAR(10),
    Category NVARCHAR(50),
    Address NVARCHAR(MAX),
    City NVARCHAR(100),
    State NVARCHAR(100),
    Pincode NVARCHAR(10),
    AnnualFamilyIncome DECIMAL(15,2),
    FamilySize INT,
    Course NVARCHAR(200),
    InstitutionID INT NULL FOREIGN KEY REFERENCES Institutions(InstitutionID) ON DELETE SET NULL,
    EnrollmentYear INT,
    BankAccountNo NVARCHAR(50),
    BankIFSC NVARCHAR(20),
    BankName NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Scholarships (
    ScholarshipID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    SponsorID INT NOT NULL FOREIGN KEY REFERENCES Sponsors(SponsorID) ON DELETE CASCADE,
    TotalBudget DECIMAL(15,2) NOT NULL,
    PerStudentAmount DECIMAL(10,2) NOT NULL,
    ApplicationOpenDate DATETIME2 NOT NULL,
    ApplicationCloseDate DATETIME2 NOT NULL,
    MaxApplicants INT,
    Status NVARCHAR(20) DEFAULT 'Active' NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE EligibilityRules (
    RuleID INT IDENTITY(1,1) PRIMARY KEY,
    ScholarshipID INT NOT NULL FOREIGN KEY REFERENCES Scholarships(ScholarshipID) ON DELETE CASCADE,
    RuleType NVARCHAR(50) NOT NULL,
    Operator NVARCHAR(10) NOT NULL,
    ValueMin NVARCHAR(200),
    ValueMax NVARCHAR(200),
    ValueList NVARCHAR(MAX),
    IsRequired BIT DEFAULT 1 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Applications (
    ApplicationID INT IDENTITY(1,1) PRIMARY KEY,
    StudentID INT NOT NULL FOREIGN KEY REFERENCES Students(StudentID) ON DELETE CASCADE,
    AgentID INT NULL FOREIGN KEY REFERENCES Agents(AgentID) ON DELETE NO ACTION,
    ScholarshipID INT NOT NULL FOREIGN KEY REFERENCES Scholarships(ScholarshipID) ON DELETE CASCADE,
    SubmissionDate DATETIME2,
    Status NVARCHAR(40) DEFAULT 'Draft' NOT NULL,
    AssignedDocReviewer INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    AssignedBGOfficer INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    AssignedScreener INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    ScholarshipAmount DECIMAL(10,2),
    SponsorID INT NULL FOREIGN KEY REFERENCES Sponsors(SponsorID) ON DELETE NO ACTION,
    AdminApprovedBy INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    AdminApprovedAt DATETIME2,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE DocumentChecklist (
    ChecklistID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL FOREIGN KEY REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    DocumentType NVARCHAR(50) NOT NULL,
    FileURL NVARCHAR(500) NOT NULL,
    UploadedAt DATETIME2,
    ReviewedBy INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    ReviewedAt DATETIME2,
    Status NVARCHAR(20) DEFAULT 'Pending' NOT NULL,
    RejectionReason NVARCHAR(500),
    ReUploadCount INT DEFAULT 0 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE BackgroundChecks (
    CheckID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL FOREIGN KEY REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    OfficerID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    CheckType NVARCHAR(50) NOT NULL,
    Result NVARCHAR(20) NOT NULL,
    Notes NVARCHAR(MAX),
    EvidenceURL NVARCHAR(500),
    CompletedAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    ApplicationID INT NOT NULL FOREIGN KEY REFERENCES Applications(ApplicationID) ON DELETE CASCADE,
    StudentID INT NULL FOREIGN KEY REFERENCES Students(StudentID) ON DELETE NO ACTION,
    InstitutionID INT NULL FOREIGN KEY REFERENCES Institutions(InstitutionID) ON DELETE NO ACTION,
    SponsorID INT NOT NULL FOREIGN KEY REFERENCES Sponsors(SponsorID) ON DELETE NO ACTION,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentType NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending' NOT NULL,
    ReferenceNo NVARCHAR(100),
    MakerID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    CheckerID INT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    MakerNotes NVARCHAR(MAX),
    CheckerNotes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE AuditLogs (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE NO ACTION,
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(50) NOT NULL,
    EntityID INT NOT NULL,
    OldValue NVARCHAR(MAX),
    NewValue NVARCHAR(MAX),
    IPAddress NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Type NVARCHAR(50) NOT NULL,
    Channel NVARCHAR(20) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    IsSent BIT DEFAULT 0 NOT NULL,
    SentAt DATETIME2,
    RetryCount INT DEFAULT 0 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- CREATE INDEXES
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_agentcode ON Users(AgentCode);
CREATE INDEX idx_agents_agentcode ON Agents(AgentCode);
CREATE INDEX idx_students_userid ON Students(UserID);
CREATE INDEX idx_scholarships_sponsorid ON Scholarships(SponsorID);
CREATE INDEX idx_eligibility_scholarshipid ON EligibilityRules(ScholarshipID);
CREATE INDEX idx_applications_scholarship_status ON Applications(ScholarshipID, Status);
CREATE INDEX idx_applications_studentid ON Applications(StudentID);
CREATE INDEX idx_docs_applicationid ON DocumentChecklist(ApplicationID);
CREATE INDEX idx_bg_applicationid ON BackgroundChecks(ApplicationID);
CREATE INDEX idx_payments_applicationid ON Payments(ApplicationID);
CREATE INDEX idx_audit_entity ON AuditLogs(EntityType, EntityID);
CREATE INDEX idx_notifications_user_sent ON Notifications(UserID, IsSent);
