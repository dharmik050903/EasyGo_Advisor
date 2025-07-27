import React, { useState } from 'react';
import { Mail, Phone, MapPin, User, Calendar, MessageCircle, Globe, GraduationCap, FileText, Shield } from 'lucide-react';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CryptoJS from "crypto-js";

// =============================================================================
// MODEL LAYER - Data structures and validation logic
// =============================================================================

/**
 * Form data model - defines the structure of appointment booking form
 */
const SECRET_KEY = "EasyGoAdvisor@1974"; // Must match backend
const isProduction = process.env.NODE_ENV === "production"; // Detect environment
const initialFormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  preferredDate: '',
  message: ''
};

/**
 * Validation rules for form fields
 * This ensures data integrity and security
 */
const validateForm = (data) => {
  const errors = {};
  
  // Name validation - only letters and spaces, 2-50 characters
  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (!/^[a-zA-Z\s]{2,50}$/.test(data.name.trim())) {
    errors.name = 'Name must contain only letters and spaces (2-50 characters)';
  }
  
  // Email validation - proper email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation - numbers, spaces, hyphens, parentheses allowed
  const phoneRegex = /^[\d\s\-\(\)\+]{10,15}$/;
  if (!data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(data.phone.trim())) {
    errors.phone = 'Please enter a valid phone number (10-15 digits)';
  }
  
  // Service selection validation
  if (!data.service) {
    errors.service = 'Please select a service';
  }
  
  // Date validation - must be today or future date
  if (!data.preferredDate) {
    errors.preferredDate = 'Please select a preferred date';
  } else {
    const selectedDate = new Date(data.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.preferredDate = 'Please select future date';
    }
  }
  
  // Message validation - optional but if provided, limit length
  if (data.message && data.message.length > 500) {
    errors.message = 'Message must be less than 500 characters';
  }
  
  return errors;
};

/**
 * Security function to sanitize input data
 * Prevents XSS attacks by removing potentially harmful characters
 */
const sanitizeInput = (value) => {
  return value.replace(/[<>\"']/g, '');
};

// =============================================================================
// VIEW LAYER - UI Components
// =============================================================================

/**
 * Header Component - Navigation bar with company branding
 */
const Header = ({ activeSection, setActiveSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu when navigation item is clicked
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[95%] mx-auto flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/Logo.jpg"
              alt="Logo"
              className="h-12 w-auto object-contain"
              style={{ maxHeight: '48px' }}
            />
          </div>
          
          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            {['Home', 'Our Services', 'Contact Us'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item.toLowerCase().replace(' ', '-'))}
                className={`text-lg font-medium transition-colors duration-200 ${
                  activeSection === item.toLowerCase().replace(' ', '-')
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-red-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {['Home', 'Our Services', 'Contact Us'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item.toLowerCase().replace(' ', '-'))}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    activeSection === item.toLowerCase().replace(' ', '-')
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Hero Section Component - Main landing area with call-to-action
 */
const HeroSection = ({ setActiveSection }) => {
  return (
    <section className="relative bg-gradient-to-r from-red-100 to-green-100 py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl lg:text-6xl font-bold text-green-600 mb-6">
              Your Gateway to 
              <span className="text-red-600"> Global</span>
              <span className="text-green-600"> Opportunities</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Expert guidance for Work Visa,Permanent Residence and Visitor Visa. 
              Make your overseas dreams a reality with Easy Go Overseas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setActiveSection('contact-us')}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200"
              >
                Book Consultation
              </button>
              <button
                onClick={() => setActiveSection('our-services')}
                className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors duration-200"
              >
                Our Services
              </button>
            </div>
          </div>
          
          {/* Image Placeholder */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-80 flex items-center justify-center">
              <img
                src="/Plane_Takeoff.jpg"
                alt="Plane Takeoff"
                className="w-full h-full object-cover rounded-lg shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #fecaca, #bbf7d0)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Services Section Component - Displays available services
 */
const ServicesSection = () => {
  const services = [
    // {
    //   icon: <GraduationCap className="w-12 h-12 text-red-600" />,
    //   title: "Study Abroad Consulting",
    //   description: "Complete guidance for university applications, course selection, and admission processes worldwide."
    // },
    {
      icon: <FileText className="w-12 h-12 text-green-600" />,
      title: "Visa Processing",
      description: "Expert assistance with visa applications, documentation, and interview preparation."
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: "Immigration Services",
      description: "Comprehensive support for permanent residency and citizenship applications."
    },
    {
      icon: <User className="w-12 h-12 text-green-600" />,
      title: "Career Counseling",
      description: "Professional guidance to help you choose the right career path and opportunities abroad."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Comprehensive solutions for your overseas journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <div className="flex justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Contact Form Component - Appointment booking form with validation
 */
const ContactForm = () => {
  // State management for form data and validation
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Add this state for the date picker
  const [selectedDate, setSelectedDate] = useState(null);

  /**
   * Handle input changes with real-time sanitizationZ
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = async () => {
    // Validate form data
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      // --- CONDITIONAL ENCRYPTION LOGIC ---
      // In production, encrypt the form data before sending
      // In development, send plain data for easier debugging
      let payload;
      if (isProduction) {
        // Encrypt data using AES
        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify(formData),
          SECRET_KEY
        ).toString();
        payload = { encrypted: encryptedData };
      } else {
        // Send plain data in development
        payload = formData;
      }
      // Send data to backend
      const response = await fetch('http://localhost:5000/api/book-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        // Try to extract error message from backend
        let errorMsg = 'Sorry, there was an error submitting your request. Please try again or contact us directly.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Ignore JSON parse errors, use default errorMsg
        }
        setSubmitMessage(errorMsg);
        return;
      }
      setSubmitMessage('Thank you! Your appointment request has been submitted successfully. We will contact you within 24 hours.');
      setFormData(initialFormData);
    } catch (error) {
      setSubmitMessage('Sorry, there was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Book Your Consultation</h2>
          <p className="text-xl text-gray-600">Take the first step towards your overseas journey</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitMessage.includes('Thank you') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitMessage}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            
            {/* Service Selection */}
            <div>
              <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                Service Required *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.service ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              >
                <option value="">Select a service</option>
                {/* <option value="study-abroad">Study Abroad Consulting</option> */}
                <option value="visa-processing">Visa Processing</option>
                <option value="immigration">Immigration Services</option>
                <option value="career-counseling">Career Counseling</option>
              </select>
              {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
            </div>
            
            {/* Preferred Date */}
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Consultation Date *
              </label>
              <ReactDatePicker
                selected={selectedDate}
                onChange={date => {
                  setSelectedDate(date);
                  handleInputChange({
                    target: {
                      name: 'preferredDate',
                      value: date ? date.toISOString().split('T')[0] : ''
                    }
                  });
                }}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
                className={`w-full px-4 py-3 rounded-lg border ${errors.preferredDate ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>
            
            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                placeholder="Tell us about your goals and requirements..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>
            
            {/* Submit Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Book Consultation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Footer Component - Contact information and company details
 */
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">  
            <img
              src="/Logo.jpg"
              alt="Logo"
              className="h-12 w-auto object-contain"
              style={{ maxHeight: '48px' }}
            />
              {/* <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Easy Go Overseas</h3> */}
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted partner for overseas education, immigration, and career opportunities.
            </p>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-red-500" />
                <span className="text-gray-300">+91 63595 02902</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-500" />
                <span className="text-gray-300">info@easygoverseas.com</span>
              </div>
            </div>
          </div>
          
          {/* Address */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Office Address</h4>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div className="text-gray-300">
                <p>421 Narayan Empire,</p>
                <p>Anand-Vidhyanagar Road,</p>
                <p>Anand, Gujarat 388120,</p>
                <p>India</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Easy Go Overseas. All rights reserved. | Making overseas dreams come true.
          </p>
        </div>
      </div>
    </footer>
  );
};

// =============================================================================
// CONTROLLER LAYER - Main App Component
// =============================================================================

/**
 * Main Application Component - Controls the entire application flow
 * This component manages the state and navigation between different sections
 */
const EasyGoOverseas = () => {
  // State to track which section is currently active
  const [activeSection, setActiveSection] = useState('home');

  /**
   * Render the appropriate section based on active state
   */
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HeroSection setActiveSection={setActiveSection} />;
      case 'our-services':
        return <ServicesSection />;
      case 'contact-us':
        return <ContactForm />;
      default:
        return <HeroSection setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Always visible */}
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main Content - Changes based on active section */}
      <main>
        {renderSection()}
      </main>
      
      {/* Footer - Always visible */}
      <Footer />
    </div>
  );
};

// Export the main component as default
export default EasyGoOverseas;