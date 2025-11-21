const grades = {
    A: { min: 86, max: 100 },
    B: { min: 71, max: 85 },
    C: { min: 61, max: 70 },
    D: { min: 50, max: 60 },
    F: { min: 41, max: 50 },
}

export const getGrade = (percentage) => {
    if (percentage >= 86 && percentage <= 100) {
        return "A";
    } else if (percentage >= 71 && percentage <= 85) {
        return "B";
    } else if (percentage >= 61 && percentage <= 70) {
        return "C";
    } else if (percentage >= 50 && percentage <= 60) {
        return "D";
    } else if (percentage >= 41 && percentage <= 50) {
        return "F";
    } else {
        return "F"; // Default to F for scores below 41
    }
}

export const getRemark = (grade) => {
    switch (grade) {
        case "A":
            return "Excellent";
        case "B":
            return "Very Good";
        case "C":
            return "Good";
        case "D":
            return "Pass";
        case "F":
            return "Fail";
        default:
            return "Fail";
    }
}

// Adjust according to ovrall grading system (I assume for now that its same as the subject grading system)
export const getOverallGrade = (percentage) => {
    // At this point, percentage should not be more than 100 or less than 0
    if (percentage >= 86 && percentage <= 100) {
        return "A";
    } else if (percentage >= 71 && percentage <= 85) {
        return "B";
    } else if (percentage >= 61 && percentage <= 70) {
        return "C";
    } else if (percentage >= 50 && percentage <= 60) {
        return "D";
    } else  {
        return "F";
    }
}

export const getOverallRemark = (grade) => {
    switch (grade) {
        case "A":
            return "Excellent";
        case "B":
            return "Very Good";
        case "C":
            return "Good";
        case "D":
            return "Pass";
        case "F":
            return "Fail";
        default:
            return "Fail";
    }
}