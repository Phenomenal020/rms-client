'use client'

import { createContext, useState } from 'react'

export const SchoolOnboardContext = createContext();

export const SchoolOnboardProvider = ({ children }) => {

    // form data - school information
    const [school, setSchool] = useState({
        schoolLocation: "",
        schoolMotto: "",
        termStart: "",
        termEnd: "",
        gradingSystem: [],
        currentGradingEntry: {
            grade: "",
            minScore: "",
            maxScore: "",
        },
        resultTemplate: null,
    });

    return (
        <SchoolOnboardContext.Provider value={{ school, setSchool }}>
            {children}
        </SchoolOnboardContext.Provider>
    )
}