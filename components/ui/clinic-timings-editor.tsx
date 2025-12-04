"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Clock, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface DayTimings {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeeklyTimings {
  monday: DayTimings;
  tuesday: DayTimings;
  wednesday: DayTimings;
  thursday: DayTimings;
  friday: DayTimings;
  saturday: DayTimings;
  sunday: DayTimings;
}

interface ClinicTimingsEditorProps {
  value?: WeeklyTimings | string | null;
  onChange: (timings: WeeklyTimings) => void;
  className?: string;
}

const DAYS = [
  { key: 'monday' as keyof WeeklyTimings, label: 'Monday' },
  { key: 'tuesday' as keyof WeeklyTimings, label: 'Tuesday' },
  { key: 'wednesday' as keyof WeeklyTimings, label: 'Wednesday' },
  { key: 'thursday' as keyof WeeklyTimings, label: 'Thursday' },
  { key: 'friday' as keyof WeeklyTimings, label: 'Friday' },
  { key: 'saturday' as keyof WeeklyTimings, label: 'Saturday' },
  { key: 'sunday' as keyof WeeklyTimings, label: 'Sunday' },
];

// Generate time options (15-minute intervals)
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Format time for display (12-hour format)
const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const defaultTimings: WeeklyTimings = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' },
};

export function ClinicTimingsEditor({ value, onChange, className }: ClinicTimingsEditorProps) {
  const [timings, setTimings] = useState<WeeklyTimings>(defaultTimings);

  // Parse initial value
  useEffect(() => {
    if (!value) {
      setTimings(defaultTimings);
      return;
    }

    try {
      let parsedTimings: WeeklyTimings;
      
      if (typeof value === 'string') {
        // Handle JSON string format
        parsedTimings = JSON.parse(value);
      } else {
        // Handle object format
        parsedTimings = value;
      }

      // Validate and fill missing properties
      const validatedTimings: WeeklyTimings = { ...defaultTimings };
      
      DAYS.forEach(({ key }) => {
        if (parsedTimings[key]) {
          validatedTimings[key] = {
            isOpen: parsedTimings[key].isOpen ?? true,
            openTime: parsedTimings[key].openTime ?? '09:00',
            closeTime: parsedTimings[key].closeTime ?? '18:00',
          };
        }
      });

      setTimings(validatedTimings);
    } catch (error) {
      console.error('Error parsing clinic timings:', error);
      setTimings(defaultTimings);
    }
  }, [value]);

  const handleTimingChange = (day: keyof WeeklyTimings, field: keyof DayTimings, newValue: boolean | string) => {
    const newTimings = {
      ...timings,
      [day]: {
        ...timings[day],
        [field]: newValue,
      },
    };
    setTimings(newTimings);
    onChange(newTimings);
  };

  const copyToAllDays = (sourceDay: keyof WeeklyTimings) => {
    const sourceTimings = timings[sourceDay];
    const newTimings: WeeklyTimings = {
      monday: { ...sourceTimings },
      tuesday: { ...sourceTimings },
      wednesday: { ...sourceTimings },
      thursday: { ...sourceTimings },
      friday: { ...sourceTimings },
      saturday: { ...sourceTimings },
      sunday: { ...sourceTimings },
    };
    
    setTimings(newTimings);
    onChange(newTimings);
  };

  const resetToDefault = () => {
    setTimings(defaultTimings);
    onChange(defaultTimings);
  };

  const getOpenDaysCount = () => {
    return DAYS.filter(({ key }) => timings[key].isOpen).length;
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label className="text-base font-medium">Clinic Hours</Label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {getOpenDaysCount()} days open
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayTiming = timings[key];
            
            return (
              <Card key={key} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Day Toggle */}
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Switch
                        checked={dayTiming.isOpen}
                        onCheckedChange={(checked) => 
                          handleTimingChange(key, 'isOpen', checked)
                        }
                      />
                      <Label className="font-medium cursor-pointer">
                        {label}
                      </Label>
                    </div>

                    {/* Time Pickers */}
                    {dayTiming.isOpen ? (
                      <div className="flex items-center gap-3 flex-1">
                        <Select
                          value={dayTiming.openTime}
                          onValueChange={(value) => 
                            handleTimingChange(key, 'openTime', value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {formatTimeDisplay(dayTiming.openTime)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTimeDisplay(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">to</span>

                        <Select
                          value={dayTiming.closeTime}
                          onValueChange={(value) => 
                            handleTimingChange(key, 'closeTime', value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {formatTimeDisplay(dayTiming.closeTime)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {formatTimeDisplay(time)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Copy Button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToAllDays(key)}
                          className="h-8 px-2"
                          title={`Copy ${label} hours to all days`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-muted-foreground">Closed</span>
                        
                        {/* Copy Button (still available for closed days) */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToAllDays(key)}
                          className="h-8 px-2 ml-auto"
                          title={`Copy ${label} status to all days`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
} 