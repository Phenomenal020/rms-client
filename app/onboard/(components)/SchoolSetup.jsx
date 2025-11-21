'use client';

import { Label } from "@/shadcn/ui/label";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";
import { Textarea } from "@/shadcn/ui/textarea";
import { Calendar } from "@/shadcn/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover"
import { ArrowLeft, CheckCircle, Plus, X, Upload, MapPin, Quote, Calendar as CalendarIcon, BookOpen, ChevronDown } from "lucide-react";
import { useState, useContext } from "react";
import { SchoolOnboardContext } from "@/context/SchoolOnboardContext";

function SchoolSetup({ setCurrentStep, goToPreviousStep }) {

    const { school, setSchool } = useContext(SchoolOnboardContext);
    const [termStartOpen, setTermStartOpen] = useState(false);
    const [termEndOpen, setTermEndOpen] = useState(false);

    // Errors state
    const [errors, setErrors] = useState({
        schoolLocation: "",
        schoolMotto: "",
        termStart: "",
        termEnd: "",
        gradingSystem: "",
        resultTemplate: "",
    });

    // Handle input change of form data
    const handleInputChange = (e) => {
        const { name, value } = e.target;  // name of the attribute and value of the attribute
        setSchool(prev => ({ ...prev, [name]: value }));

        // Clear error when the user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Handle grading entry change
    const handleGradingEntryChange = (e) => {
        const { name, value } = e.target;
        setSchool(prev => ({
            ...prev,
            currentGradingEntry: {
                ...prev.currentGradingEntry,
                [name]: value
            }
        }));
    };

    // Handle add grading entry 
    const addGradingEntry = () => {
        const { grade, minScore, maxScore } = school.currentGradingEntry;

        // Validate that grading entry fields are valid
        if (grade.trim() && minScore && maxScore) {
            // Validate that minScore is less than maxScore
            if (parseInt(minScore) < parseInt(maxScore)) {
                setSchool(prev => ({
                    ...prev,
                    gradingSystem: [...prev.gradingSystem, { ...prev.currentGradingEntry }],
                    currentGradingEntry: {
                        grade: '',
                        minScore: '',
                        maxScore: ''
                    }
                }));
            } else if (parseInt(maxScore) < parseInt(minScore)) {
                alert('Maximum score must be greater than minimum score');
            } else {
                alert('Invalid grading entry');
            }
        };
    }

    // Handle remove grading entry (by returning a new array w/o the index)
    const removeGradingEntry = (index) => {
        setSchool(prev => ({
            ...prev,
            gradingSystem: prev.gradingSystem.filter((_, i) => i !== index)
        }));
    };

    // Handle file upload - simply update the resultTemplate to file
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSchool(prev => ({
                ...prev,
                resultTemplate: file
            }));
        }
    };

    // Validate the form data
    const validateForm = () => {
        const newErrors = {}
        // School validation
        if (!school.schoolLocation.trim()) {
            newErrors.schoolLocation = "School location is required";
        }
        if (!school.termStart) {
            newErrors.termStart = "Term start date is required";
        }
        if (!school.termEnd) {
            newErrors.termEnd = "Term end date is required";
        }
        if (school.gradingSystem.length === 0) {
            newErrors.gradingSystem = "At least one grading entry is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit of form data
    const handleSchoolSetupSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
            // TODO: Save the form data to the database
            setCurrentStep(prev => prev + 1);
        }
    };

    return (
        <form onSubmit={handleSchoolSetupSubmit} className="space-y-6">

            {/* School Location */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="schoolLocation" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location:
                </Label>
                {/* Input */}
                <Input
                    id="schoolLocation"
                    name="schoolLocation"
                    type="text"
                    placeholder="Enter school address or location"
                    value={school.schoolLocation}
                    onChange={handleInputChange}
                    className={`transition-all duration-200 ${errors.schoolLocation ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'}`}
                />
                {/* Error */}
                {errors.schoolLocation && (
                    <p className="text-sm text-red-500">{errors.schoolLocation}</p>
                )}
            </div>

            {/* School Motto */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="schoolMotto" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Quote className="w-4 h-4" />
                    Motto (Optional):
                </Label>
                {/* Input */}
                <Textarea
                    id="schoolMotto"
                    name="schoolMotto"
                    placeholder="Enter your school motto if you want this to appear on the result sheet"
                    value={school.schoolMotto}
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus-visible:ring-blue-500"
                    rows={3}
                />
            </div>

            {/* Term Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Term Start Date */}
                <div className="space-y-2">
                    {/* Label */}
                    <Label htmlFor="termStart" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Term Start Date:
                    </Label>
                    {/* Input */}
                    <Popover open={termStartOpen} onOpenChange={setTermStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="termStart"
                                className="w-64 justify-between font-normal"
                            >
                                {school.termStart ? school.termStart.toLocaleDateString() : "Select date"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 overflow-hidden p-2" align="start">
                            <Calendar
                                mode="single"
                                selected={school.termStart}
                                captionLayout="dropdown"
                                className="w-full"
                                onSelect={(date) => {
                                    setSchool(prev => ({
                                        ...prev,
                                        termStart: date
                                    }));
                                    setTermStartOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {/* Error */}
                    {errors.termStart && (
                        <p className="text-sm text-red-500">{errors.termStart}</p>
                    )}
                </div>
                {/* Term End Date */}
                <div className="space-y-2">
                    {/* Label */}
                    <Label htmlFor="termEnd" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Term End Date:
                    </Label>
                    {/* Input */}
                    <Popover open={termEndOpen} onOpenChange={setTermEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="termEnd"
                                className="w-64 justify-between font-normal"
                            >
                                {school.termEnd ? school.termEnd.toLocaleDateString() : "Select date"}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 overflow-hidden p-2" align="start">
                            <Calendar
                                mode="single"
                                selected={school.termEnd}
                                captionLayout="dropdown"
                                className="w-full"
                                onSelect={(date) => {
                                    setSchool(prev => ({
                                        ...prev,
                                        termEnd: date
                                    }));
                                    setTermEndOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {/* Error */}
                    {errors.termEnd && (
                        <p className="text-sm text-red-500">{errors.termEnd}</p>
                    )}
                </div>
            </div>

            {/* Grading System */}
            <div className="space-y-4">
                <div className="space-y-2">
                    {/* Label */}
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Grading System:
                    </Label>
                    {/* Description */}
                    <p className="text-sm text-gray-500">Add grade ranges (e.g., A: 90-100, B: 80-89)</p>
                </div>

                {/* Add Grading Entry */}
                <div className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-3">
                        {/* Label */}
                        <Input
                            placeholder="Grade (A, B, C...)"
                            value={school.currentGradingEntry.grade}
                            name="grade"
                            type="text"
                            onChange={handleGradingEntryChange}
                        />
                    </div>
                    <div className="col-span-3">
                        {/* Label */}
                        <Input
                            placeholder="Min Score"
                            type="number"
                            min="0"
                            name="minScore"
                            value={school.currentGradingEntry.minScore}
                            onChange={handleGradingEntryChange}
                        />
                    </div>
                    <div className="col-span-3">
                        {/* Label */}
                        <Input
                            placeholder="Max Score"
                            type="number"
                            min="0"
                            max="100"
                            name="maxScore"
                            value={school.currentGradingEntry.maxScore}
                            onChange={handleGradingEntryChange}
                        />
                    </div>
                    <div className="col-span-3">
                        {/* Button */}
                        <Button type="button" onClick={addGradingEntry} className="w-full">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Display Grading Entries (if any) */}
                {school.gradingSystem.length > 0 && (
                    <div className="space-y-2">
                        {/* Grading Entry */}
                        {school.gradingSystem.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-sm bg-gray-100">
                                <span className="text-gray-700">{entry.grade}: {entry.minScore}-{entry.maxScore}</span>
                                {/* Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeGradingEntry(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Error */}
                {school.gradingSystem.length === 0 && (
                    <p className="text-sm text-red-500">{errors.gradingSystem}</p>
                )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
                {/* Label */}
                <Label htmlFor="resultTemplate" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Result Template (Optional)
                </Label>
                {/* Input */}
                <Input
                    id="resultTemplate"
                    name="resultTemplate"
                    type="file"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="transition-all duration-200 focus-visible:ring-blue-500"
                />
                {/* Description */}
                <p className="text-sm text-gray-500">Upload a template for student results (PDF, Word, or Excel)</p>
                {school.resultTemplate && (
                    <p className="text-sm text-green-600">✓ {school.resultTemplate.name}</p>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
                {/* Back Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex-1"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                {/* Complete Setup Button */}
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                >
                    Proceed to Add Subjects
                    <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
            </div>

        </form>
    );
}

export default SchoolSetup;