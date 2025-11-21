"use client";

import { useState, useContext } from "react";

import {  CheckSquare, Square, Plus, Trash2, CheckCircle, ArrowLeft, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Button } from "@/shadcn/ui/button";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";

import { AddStudentsContext } from "@/context/AddStudentsContext";
import { AddSubjectsContext } from "@/context/AddSubjectsContext";

function AddStudents({ handleSubmit, setCurrentStep, goToPreviousStep }) {

    const { students, setStudents, newStudent, setNewStudent } = useContext(AddStudentsContext);
    const { selectedSubjects } = useContext(AddSubjectsContext);

    const [errors, setErrors] = useState({});
    const [dateOfBirthOpen, setDateOfBirthOpen] = useState(false);

    const addStudent = () => {
        if (newStudent.name.trim() && newStudent.dateOfBirth && newStudent.gender &&
            newStudent.className.trim() && newStudent.department) {
            // Create a new student object
            const student = {
                id: Date.now(),
                name: newStudent.name.trim(),
                dateOfBirth: newStudent.dateOfBirth,
                gender: newStudent.gender,
                className: newStudent.className.trim(),
                studentId: newStudent.id.trim() || "",
                department: newStudent.department,
                daysPresent: parseInt(newStudent.daysPresent) || 0,
                termDays: parseInt(newStudent.termDays) || 0,
                subjects: [...newStudent.subjects]
            };
            // Add the new student to the form data - students array
            setStudents(prev => [...prev, student]);
            // Reset the new student object - clear the form (but keep termDays and className)
            setNewStudent(prev => ({
                ...prev,
                name: "",
                dateOfBirth: "",
                gender: "",
                id: "",
                department: "",
                daysPresent: "",
                // Keep termDays and className unchanged
            }));
            // Close the date of birth popover
            setDateOfBirthOpen(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!newStudent.name.trim()) {
            newErrors.name = "Name is required";
        }
        // Student ID is optional, so no validation needed
        if (students.length === 0) {
            newErrors.students = "At least one student is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleStudentSubject = (subject) => {
        const subjectToToggle = typeof subject === 'object' ? subject : { name: subject };
        setNewStudent(prev => ({
            ...prev,
            subjects: prev.subjects.some(s => 
                (typeof s === 'object' ? s.name : s) === (typeof subject === 'object' ? subject.name : subject)
            )
                ? prev.subjects.filter(s => 
                    (typeof s === 'object' ? s.name : s) !== (typeof subject === 'object' ? subject.name : subject)
                )
                : [...prev.subjects, subjectToToggle]
        }));
    };

    const handleAddStudentsSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const removeStudent = (id) => {
        setStudents(prev => prev.filter(student => student.id !== id));
    };

    return (
        <form onSubmit={handleAddStudentsSubmit} className="space-y-6">
            {/* Add Student Section */}
            <div className="space-y-4">

                {/* Student Form */}
                <Card className="border border-gray-200">
                    {/* New Student Form */}
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-semibold text-gray-900">New Student</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="studentName" className="text-sm font-medium text-gray-700">
                                    Full Name
                                </Label>
                                <Input
                                    id="studentName"
                                    placeholder="Enter student's full name"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                                    className="transition-all duration-200 focus-visible:ring-blue-500"
                                />
                            </div>
                            {/* Student ID */}
                            <div className="space-y-2">
                                <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">
                                    Student ID <span className="text-gray-500 font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="studentId"
                                    placeholder="e.g., STU001, 2024001"
                                    value={newStudent.id}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, id: e.target.value }))}
                                    className="transition-all duration-200 focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    Date of Birth
                                </Label>
                                <Popover open={dateOfBirthOpen} onOpenChange={setDateOfBirthOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="dateOfBirth"
                                            className="w-full justify-between font-normal"
                                        >
                                            {newStudent.dateOfBirth 
                                                ? (newStudent.dateOfBirth instanceof Date 
                                                    ? newStudent.dateOfBirth.toLocaleDateString()
                                                    : new Date(newStudent.dateOfBirth).toLocaleDateString())
                                                : "Select date"}
                                            <ChevronDown className="w-4 h-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={newStudent.dateOfBirth 
                                                ? (newStudent.dateOfBirth instanceof Date 
                                                    ? newStudent.dateOfBirth 
                                                    : new Date(newStudent.dateOfBirth))
                                                : undefined}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                if (date) {
                                                    // Convert Date to ISO string format (YYYY-MM-DD) for storage
                                                    const dateString = date.toISOString().split('T')[0];
                                                    setNewStudent(prev => ({ ...prev, dateOfBirth: dateString }));
                                                    setDateOfBirthOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {/* Gender */}
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                                    Gender
                                </Label>
                                <Select value={newStudent.gender} onValueChange={(value) => setNewStudent(prev => ({ ...prev, gender: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Class */}
                            <div className="space-y-2">
                                <Label htmlFor="className" className="text-sm font-medium text-gray-700">
                                    Class
                                </Label>
                                <Input
                                    id="className"
                                    placeholder="e.g., Grade 5A, Class 10B"
                                    value={newStudent.className}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, className: e.target.value }))}
                                    className="transition-all duration-200 focus-visible:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Department */}
                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                                    Department
                                </Label>
                                <Select value={newStudent.department} onValueChange={(value) => setNewStudent(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="science">Science</SelectItem>
                                        <SelectItem value="arts">Arts</SelectItem>
                                        <SelectItem value="commerce">Commerce</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Days Present */}
                            <div className="space-y-2">
                                <Label htmlFor="daysPresent" className="text-sm font-medium text-gray-700">
                                    Days Present
                                </Label>
                                <Input
                                    id="daysPresent"
                                    type="number"
                                    placeholder="0"
                                    value={newStudent.daysPresent}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, daysPresent: e.target.value }))}
                                    className="transition-all duration-200 focus-visible:ring-blue-500"
                                    min="0"
                                />
                            </div>
                            {/* Term Days */}
                            <div className="space-y-2">
                                <Label htmlFor="termDays" className="text-sm font-medium text-gray-700">
                                    Term Days
                                </Label>
                                <Input
                                    id="termDays"
                                    type="number"
                                    placeholder="e.g., 180"
                                    value={newStudent.termDays}
                                    onChange={(e) => setNewStudent(prev => ({ ...prev, termDays: e.target.value }))}
                                    className="transition-all duration-200 focus-visible:ring-blue-500"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Subject Selection - from selectedSubjects context */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Select Subjects</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedSubjects.map((subject, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleStudentSubject(subject)}
                                            className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md transition-colors"
                                        >
                                            {newStudent.subjects.some(s => 
                                                (typeof s === 'object' ? s.name : s) === (typeof subject === 'object' ? subject.name : subject)
                                            ) ? (
                                                <CheckSquare className="w-4 h-4 text-blue-600" />
                                            ) : (
                                                <Square className="w-4 h-4 text-gray-400" />
                                            )}
                                            <span className="text-sm text-gray-700">{subject.name || subject}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="button" onClick={addStudent} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Student
                        </Button>
                    </CardContent>
                </Card>

                {errors.students && (
                    <p className="text-sm text-red-500">{errors.students}</p>
                )}
            </div>

            {/* Students List */}
            {students.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Added Students ({students.length})</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {students.map((student) => (
                            <Card key={student.id} className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                            {student.studentId && (
                                                <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                                            )}
                                            <p className="text-sm text-gray-600">{student.className} • {student.department}</p>
                                            <p className="text-sm text-gray-600">
                                                {student.gender} • Born: {new Date(student.dateOfBirth).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Attendance: {student.daysPresent} present, {student.termDays ? (student.termDays - student.daysPresent) : 0} absent (of {student.termDays || 0} total days)
                                            </p>
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-500">Subjects:</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {student.subjects.map((subject, index) => (
                                                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {typeof subject === 'object' ? subject.name : subject}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeStudent(student.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex-1"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    Complete Setup
                    <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </form>
    );
}

export default AddStudents;