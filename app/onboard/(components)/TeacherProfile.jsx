'use client';

import { User, Mail, School, BookOpen } from "lucide-react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useContext } from "react";
import { TeacherOnboardContext } from "@/context/TeacherOnboardContext";

function TeacherProfile({ handleSubmit, setCurrentStep }) {

    const { teacher, setTeacher } = useContext(TeacherOnboardContext);

    // Errors state
    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        school: "",
        class: ""
    });

    // Handle input change of form data
    const handleTeacherProfileInputChange = (e) => {
        const { name, value } = e.target; // Get the name and value of the input field
        setTeacher(prev => ({ ...prev, [name]: value })); // Update the form data with the new value
    };

    // Validate the form data
    const validateTeacherProfileForm = () => {
        const newErrors = {};

        // Teacher validation
        if (!teacher?.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!teacher?.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!teacher?.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(teacher.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!teacher?.school.trim()) {
            newErrors.school = "School name is required";
        }

        if (!teacher?.class.trim()) {
            newErrors.class = "Class name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }

    // Handle submit of form data
    const handleTeacherProfileSubmit = (e) => {
        e.preventDefault(); // Prevent the default form submission
        const isValid = validateTeacherProfileForm(); // Validate the form
        if (isValid) {
            // TODO: Save the form data to the database? Maybe Later... Not now.
            setCurrentStep(prev => prev + 1); // Set the current step to 2 if there are no errors
        }
    };

    return (
        <form onSubmit={handleTeacherProfileSubmit} className="space-y-6">

            {/* Row1 - Teacher Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* First Name */}
                <div className="space-y-2">
                    {/* Label */}
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        First Name:
                    </Label>
                    {/* Input */}
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        value={teacher.firstName}
                        onChange={handleTeacherProfileInputChange}
                        className={`transition-all duration-200 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                    />
                    {/* Error */}
                    {errors.firstName && (
                        <p className="text-sm text-red-500">{errors.firstName}</p>
                    )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                    {/* Label */}
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Last Name:
                    </Label>
                    {/* Input */}
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        value={teacher.lastName}
                        onChange={handleTeacherProfileInputChange}
                        className={`transition-all duration-200 ${errors.lastName ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                    />
                    {/* Error */}
                    {errors.lastName && (
                        <p className="text-sm text-red-500">{errors.lastName}</p>
                    )}
                </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address:
                </Label>
                {/* Input */}
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={teacher.email}
                    onChange={handleTeacherProfileInputChange}
                    className={`transition-all duration-200 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                />
                {/* Error */}
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                )}
            </div>

            {/* School Field */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="school" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <School className="w-4 h-4" />
                    School:
                </Label>
                {/* Input */}
                <Input
                    id="school"
                    name="school"
                    type="text"
                    placeholder="Enter your school name"
                    value={teacher.school}
                    onChange={handleTeacherProfileInputChange}
                    className={`transition-all duration-200 ${errors.school ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                />
                {/* Error */}
                {errors.school && (
                    <p className="text-sm text-red-500">{errors.school}</p>
                )}
            </div>

            {/* Class Field */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="className" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Class:
                </Label>
                {/* Input */}
                <Input
                    id="class"
                    name="class"
                    type="text"
                    placeholder="e.g., Basic 5A, Primary 3"
                    value={teacher.class}
                    onChange={handleTeacherProfileInputChange}
                    className={`transition-all duration-200 ${errors.class ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                />
                {/* Error */}
                {errors.class && (
                    <p className="text-sm text-red-500">{errors.class}</p>
                )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <Button
                    type="submit"
                    onClick={handleTeacherProfileSubmit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    Continue to School Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </form>

    );
};

export default TeacherProfile;