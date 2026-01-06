import React, { useState, useEffect } from "react";

interface CircularDatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    getDateColor?: (date: Date) => string;
    onMonthChange?: (date: Date) => void;
    className?: string; // Allow custom styling for the input/trigger
}

export default function CircularDatePicker({
    selectedDate,
    onDateChange,
    getDateColor,
    onMonthChange,
    className
}: CircularDatePickerProps) {
    const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Sync internal state if selectedDate changes externally (e.g. initial load)
    useEffect(() => {
        if (selectedDate) {
            // Only update month view if it's far apart? or just keep it simple.
            // Let's not force-jump current view unless really needed, or maybe we should.
            // For now, let's keep currentDate independent for navigation, 
            // but maybe initialize it with selectedDate if provided.
        }
    }, [selectedDate]);

    useEffect(() => {
        if (onMonthChange) {
            onMonthChange(currentDate);
        }
    }, [currentDate, onMonthChange]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handleDateClick = (day: number) => {
        const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        onDateChange(selected);
        setShowDatePicker(false);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Generate calendar grid
    const generateCalendar = () => {
        const calendar = [];
        const totalCells = 42; // 6 weeks * 7 days
        let dayCounter = 1;

        for (let i = 0; i < totalCells; i++) {
            if (i < firstDayOfMonth || dayCounter > daysInMonth) {
                calendar.push(null); // Empty cell
            } else {
                calendar.push(dayCounter++);
            }
        }
        return calendar;
    };

    const calendarDays = generateCalendar();

    // Default color logic if none provided
    const defaultGetDateColor = (date: Date) => {
        return '#374151'; // Text gray-700
    };

    const resolveColor = (date: Date) => {
        if (getDateColor) return getDateColor(date);
        return defaultGetDateColor(date);
    };

    return (
        <div className="relative">
            <input
                type="text"
                readOnly
                value={selectedDate ? selectedDate.toLocaleDateString('id-ID') : ''}
                onClick={() => setShowDatePicker(true)}
                className={`w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]/50 cursor-pointer text-gray-800 ${className || ''}`}
                placeholder="Pilih Tanggal"
            />
            {showDatePicker && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]" onClick={() => setShowDatePicker(false)}>

                    <div className="bg-white border rounded-lg shadow-lg p-4 w-80"
                        style={{
                            width: 300,
                            textAlign: "center",
                            border: "3px solid #00427c",
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={prevMonth} className="text-[#0B3D91] font-bold text-lg hover:bg-gray-100 px-2 rounded">‹</button>
                            <span className="font-semibold text-[#0B3D91]">
                                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="text-[#0B3D91] font-bold text-lg hover:bg-gray-100 px-2 rounded">›</button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, index) => {
                                const dateObj = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;

                                const isSelected = day && selectedDate &&
                                    selectedDate.getDate() === day &&
                                    selectedDate.getMonth() === currentDate.getMonth() &&
                                    selectedDate.getFullYear() === currentDate.getFullYear();

                                const isToday = day && new Date().getDate() === day &&
                                    new Date().getMonth() === currentDate.getMonth() &&
                                    new Date().getFullYear() === currentDate.getFullYear();

                                const dayColor = dateObj ? resolveColor(dateObj) : '#374151';

                                return (
                                    <button
                                        key={index}
                                        type="button" // Prevent form submission
                                        onClick={() => day && handleDateClick(day)}
                                        disabled={!day}
                                        className={`
                                            w-8 h-8 text-sm rounded-md transition-colors
                                            ${!day ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'}
                                            ${isSelected ? 'bg-[#0B3D91] text-white font-bold' :
                                                isToday ? 'bg-blue-100 text-blue-600 font-semibold' :
                                                    day ? 'text-gray-700' : 'text-gray-300'}
                                        `}
                                        style={{
                                            color: isSelected || isToday ? undefined : dayColor,
                                        }}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setShowDatePicker(false)}

                                className="border border-red-600 text-red-600 px-3 py-1 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};
