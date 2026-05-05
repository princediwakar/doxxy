'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { submitContactForm } from '@/actions/contact';
import { showErrorToast } from '@/lib/error-utils';
import { toast } from 'sonner';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
  message: '',
};

export function ContactForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      if (result.error) {
        setError(result.error);
        showErrorToast(result.error);
      } else {
        setIsSubmitted(true);
        setFormData(initialFormData);
        toast.success('Message sent successfully!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Thank You!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold"
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200/75 dark:border-gray-700/50">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Send us a Message</h3>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-8">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
          <Textarea
            id="message"
            required
            rows={5}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            placeholder="Tell us more about your practice and how we can help..."
            className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Dr. John Smith"
              className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 80-1234-5678"
              className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Practice/Organization Name</label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="ABC Medical Center"
              className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Bengaluru"
              className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 rounded-lg p-3"
            />
          </div>
        </div>
        {error && (
          <div className="text-red-500 dark:text-red-400 mb-4 text-sm">{error}</div>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-xl py-3 text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  );
}
