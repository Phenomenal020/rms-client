# Prisma Relationship Requirements Guide

This document explains what information is required when creating records with relationships in your schema.

## Key Principle
**You only need to provide the foreign key ID** - you don't need to create the full related object. Just reference an existing record by its ID.

---

## Required Relationships (Must Provide Foreign Key)

### 1. **GradingSystem** → **School** (Required)
```prisma
schoolId  String    // NOT nullable - must provide
school    School    @relation(...)
```

**When creating a GradingSystem:**
```typescript
// ✅ CORRECT - Just provide the schoolId
await prisma.gradingSystem.create({
  data: {
    grade: "A",
    minScore: 90,
    maxScore: 100,
    schoolId: "existing-school-id"  // ← Only need the ID
  }
})

// ❌ WRONG - Don't need to create School object
// You can't do nested create here because schoolId is required
```

**Note:** The School must already exist before creating a GradingSystem.

---

### 2. **Subject** → **School** (Required)
```prisma
schoolId  String    // NOT nullable - must provide
school    School    @relation(...)
```

**When creating a Subject:**
```typescript
// ✅ CORRECT
await prisma.subject.create({
  data: {
    name: "Mathematics",
    schoolId: "existing-school-id"  // ← Only need the ID
  }
})
```

---

### 3. **Subject** → **AssessmentStructure** (Optional)
```prisma
assessmentStructureId String?  // Nullable - optional
assessmentStructure  AssessmentStructure?
```

**When creating a Subject:**
```typescript
// ✅ Can create without assessment structure
await prisma.subject.create({
  data: {
    name: "Mathematics",
    schoolId: "school-id"
    // assessmentStructureId is optional - can skip it
  }
})

// ✅ Or provide it if you have one
await prisma.subject.create({
  data: {
    name: "Mathematics",
    schoolId: "school-id",
    assessmentStructureId: "existing-assessment-id"  // ← Optional
  }
})
```

---

### 4. **AssessmentStructure** → **School** (Required)
```prisma
schoolId  String    // NOT nullable - must provide
school    School    @relation(...)
```

**When creating an AssessmentStructure:**
```typescript
// ✅ CORRECT
await prisma.assessmentStructure.create({
  data: {
    type: "Exam",
    percentage: 60,
    schoolId: "existing-school-id"  // ← Only need the ID
  }
})
```

---

### 5. **Student** → **School** (Required)
```prisma
schoolId  String    // NOT nullable - must provide
school    School    @relation(...)
```

**When creating a Student:**
```typescript
// ✅ CORRECT
await prisma.student.create({
  data: {
    firstName: "John",
    lastName: "Doe",
    className: "Grade 5A",
    schoolId: "existing-school-id"  // ← Only need the ID
    // Optional fields can be skipped
  }
})
```

---

### 6. **StudentSubject** (Junction Table) - Both Required
```prisma
studentId String    // NOT nullable
subjectId String    // NOT nullable
```

**When creating a StudentSubject:**
```typescript
// ✅ CORRECT - Just provide both IDs
await prisma.studentSubject.create({
  data: {
    studentId: "existing-student-id",  // ← Only need IDs
    subjectId: "existing-subject-id"    // ← Only need IDs
  }
})
```

---

### 7. **User** → **School** (Optional)
```prisma
schoolId  String?   // Nullable - optional
school    School?   @relation(...)
```

**When creating a User:**
```typescript
// ✅ Can create without school
await prisma.user.create({
  data: {
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com"
    // schoolId is optional - can skip it
  }
})

// ✅ Or provide it if you have one
await prisma.user.create({
  data: {
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    schoolId: "existing-school-id"  // ← Optional
  }
})
```

---

## Creating Order Matters!

Because of required relationships, you must create records in this order:

### ✅ Correct Creation Order:

1. **First: Create School** (no dependencies)
   ```typescript
   const school = await prisma.school.create({
     data: { schoolName: "ABC School" }
   })
   ```

2. **Second: Create related records** (need schoolId)
   ```typescript
   // Create GradingSystem
   await prisma.gradingSystem.create({
     data: {
       grade: "A",
       minScore: 90,
       maxScore: 100,
       schoolId: school.id  // ← Use the created school's ID
     }
   })

   // Create Subject
   const subject = await prisma.subject.create({
     data: {
       name: "Mathematics",
       schoolId: school.id  // ← Use the created school's ID
     }
   })

   // Create AssessmentStructure
   const assessment = await prisma.assessmentStructure.create({
     data: {
       type: "Exam",
       percentage: 60,
       schoolId: school.id  // ← Use the created school's ID
     }
   })

   // Create Student
   const student = await prisma.student.create({
     data: {
       firstName: "John",
       lastName: "Doe",
       className: "Grade 5A",
       schoolId: school.id  // ← Use the created school's ID
     }
   })
   ```

3. **Third: Create junction table records** (need both studentId and subjectId)
   ```typescript
   await prisma.studentSubject.create({
     data: {
       studentId: student.id,  // ← Use created IDs
       subjectId: subject.id   // ← Use created IDs
     }
   })
   ```

4. **Optional: Link Subject to AssessmentStructure** (both already exist)
   ```typescript
   await prisma.subject.update({
     where: { id: subject.id },
     data: {
       assessmentStructureId: assessment.id  // ← Link them
     }
   })
   ```

---

## Using Nested Writes (Alternative Approach)

Prisma also supports nested writes, but they're more complex:

```typescript
// ✅ Create School with nested GradingSystem
await prisma.school.create({
  data: {
    schoolName: "ABC School",
    gradingSystem: {
      create: [
        { grade: "A", minScore: 90, maxScore: 100 }
      ]
    }
  }
})

// ✅ Create Student with nested StudentSubject
await prisma.student.create({
  data: {
    firstName: "John",
    lastName: "Doe",
    className: "Grade 5A",
    schoolId: "school-id",
    subjects: {
      create: [
        { subject: { connect: { id: "subject-id" } } }
      ]
    }
  }
})
```

**But this is more complex and not always necessary.**

---

## Summary

| Relationship | Required? | What You Need |
|-------------|-----------|---------------|
| GradingSystem → School | ✅ Yes | `schoolId` (string) |
| Subject → School | ✅ Yes | `schoolId` (string) |
| Subject → AssessmentStructure | ❌ No | `assessmentStructureId` (optional) |
| AssessmentStructure → School | ✅ Yes | `schoolId` (string) |
| Student → School | ✅ Yes | `schoolId` (string) |
| StudentSubject → Student | ✅ Yes | `studentId` (string) |
| StudentSubject → Subject | ✅ Yes | `subjectId` (string) |
| User → School | ❌ No | `schoolId` (optional) |

**Key Takeaway:** You only need to provide the foreign key ID. The related object must already exist in the database (except for optional relationships, which you can skip entirely).

