-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "AISettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AISettings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AISettings_userId_provider_key" ON "AISettings"("userId", "provider");

CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "chineseText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CheckResult" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrammarError" (
    "id" TEXT NOT NULL,
    "checkResultId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "correctedText" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "position" INTEGER,
    "sentenceContext" TEXT,
    CONSTRAINT "GrammarError_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpressionOpt" (
    "id" TEXT NOT NULL,
    "checkResultId" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "improvedText" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "position" INTEGER,
    "sentenceContext" TEXT,
    CONSTRAINT "ExpressionOpt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OverallScore" (
    "id" TEXT NOT NULL,
    "checkResultId" TEXT NOT NULL,
    "ieltsScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "mainIssues" TEXT NOT NULL,
    CONSTRAINT "OverallScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OverallScore_checkResultId_key" ON "OverallScore"("checkResultId");

CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT,
    "content" TEXT NOT NULL,
    "translation" TEXT,
    "noteType" TEXT NOT NULL,
    "sentenceContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chineseArticle" TEXT NOT NULL,
    "sourceNoteIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PracticeResult" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "checkResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AISettings" ADD CONSTRAINT "AISettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Article" ADD CONSTRAINT "Article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckResult" ADD CONSTRAINT "CheckResult_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CheckResult" ADD CONSTRAINT "CheckResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GrammarError" ADD CONSTRAINT "GrammarError_checkResultId_fkey" FOREIGN KEY ("checkResultId") REFERENCES "CheckResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExpressionOpt" ADD CONSTRAINT "ExpressionOpt_checkResultId_fkey" FOREIGN KEY ("checkResultId") REFERENCES "CheckResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OverallScore" ADD CONSTRAINT "OverallScore_checkResultId_fkey" FOREIGN KEY ("checkResultId") REFERENCES "CheckResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Note" ADD CONSTRAINT "Note_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PracticeResult" ADD CONSTRAINT "PracticeResult_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PracticeResult" ADD CONSTRAINT "PracticeResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
