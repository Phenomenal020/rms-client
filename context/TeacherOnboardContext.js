'use client'

import { createContext, useState } from 'react'

export const TeacherOnboardContext = createContext();

export const TeacherOnboardProvider = ({ children }) => {

    // Teacher information
    const [teacher, setTeacher] = useState({
        firstName: '',
        lastName: '',
        email: '',
        school: '',
        class: ''
    });

    return (
        <TeacherOnboardContext.Provider value={{ teacher, setTeacher }}>
            {children}
        </TeacherOnboardContext.Provider>
    )

}