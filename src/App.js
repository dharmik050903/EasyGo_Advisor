import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, User, Calendar, MessageCircle, Globe, GraduationCap, FileText, Shield, Target, CheckCircle, HeartHandshake, TrendingUp, Calendar as CalendarIcon, CheckCircle2, BarChart3 } from 'lucide-react';
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CryptoJS from "crypto-js";

// =============================================================================
// MODEL LAYER - Data structures and validation logic
// =============================================================================

/**
 * Form data model - defines the structure of appointment booking form
 */
// Get SECRET_KEY from environment variables, fallback to default for development
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "EasyGoAdvisor@1974";
const isProduction = process.env.NODE_ENV === "production"; // Detect environment
// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const initialFormData = {
  name: '',
  email: '',
  phone: '',
  state: '',
  service: '',
  preferredDate: '',
  message: '',
  // Eligibility fields (optional)
  englishLevel: '',
  age: '',
  education: '',
  experience: '',
  visaType: ''
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
  
  // Eligibility fields validation (now required)
  if (!data.englishLevel) {
    errors.englishLevel = 'English level is required';
  }
  if (!data.age) {
    errors.age = 'Age is required';
  }
  if (!data.education) {
    errors.education = 'Education is required';
  }
  if (!data.experience) {
    errors.experience = 'Experience is required';
  }
  if (!data.visaType) {
    errors.visaType = 'Visa type is required';
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

  const handleLogoClick = () => {
    setActiveSection('home');
    setIsMobileMenuOpen(false); // Close mobile menu when logo is clicked
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-[95%] mx-auto flex justify-between items-center py-4">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center hover-scale transition-all-smooth cursor-pointer focus:outline-none"
            aria-label="Go to home page"
          >
            <img
              src="/Logo.jpg"
              alt="Easy Go Overseas Logo"
              className="h-12 w-auto object-contain transition-all-smooth"
              style={{ maxHeight: '48px' }}
            />
          </button>
          
          {/* Desktop Navigation Menu */}
          <nav className="hidden md:flex space-x-8">
            {['Home', 'About Us', 'Our Services', 'Contact Us'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item.toLowerCase().replace(' ', '-'))}
                className={`text-lg font-medium transition-all-smooth relative pb-1 ${
                  activeSection === item.toLowerCase().replace(' ', '-')
                    ? 'text-red-600'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                {item}
                {activeSection === item.toLowerCase().replace(' ', '-') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                )}
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
          <div className="md:hidden animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {['Home', 'About Us', 'Our Services', 'Contact Us'].map((item) => (
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
 * Statistics Card Component with Animated Counter
 */
const StatCard = ({ value, suffix, label, icon, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timerRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const observerRef = React.useRef(null);

  const animateCounter = React.useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    timerRef.current = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.ceil(increment * currentStep), value);
      setCount(newCount);

      if (currentStep >= steps) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setCount(value);
      }
    }, stepDuration);
  }, [value]);

  useEffect(() => {
    // Fallback: If IntersectionObserver is not supported or fails, animate after a delay
    const fallbackTimeout = setTimeout(() => {
      if (!hasAnimated && cardRef.current) {
        setHasAnimated(true);
        setTimeout(() => {
          animateCounter();
        }, delay);
      }
    }, 1000);

    // Try to use IntersectionObserver
    // Use a small delay to ensure DOM is ready, especially on iOS
    const setupObserver = setTimeout(() => {
      if (typeof IntersectionObserver !== 'undefined' && cardRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !hasAnimated) {
                clearTimeout(fallbackTimeout);
                setHasAnimated(true);
                setTimeout(() => {
                  animateCounter();
                }, delay);
              }
            });
          },
          { 
            threshold: 0.1,
            rootMargin: '50px' // Start animation slightly before element is fully visible
          }
        );

        // Use requestAnimationFrame to ensure element is in DOM
        requestAnimationFrame(() => {
          if (cardRef.current && observerRef.current) {
            observerRef.current.observe(cardRef.current);
          }
        });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(fallbackTimeout);
      clearTimeout(setupObserver);
      if (observerRef.current && cardRef.current) {
        observerRef.current.unobserve(cardRef.current);
        observerRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [delay, hasAnimated, value, suffix, animateCounter]);

  // Calculate progress percentage (for percentage values, use count directly; for others, calculate percentage)
  const getProgress = () => {
    if (suffix === '%') {
      return count;
    }
    // For other values, calculate percentage based on reaching the value
    return Math.min((count / value) * 100, 100);
  };

  const progress = getProgress();
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      ref={cardRef}
      id={`stat-${value}-${suffix}`}
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
    >
      <div className="flex flex-col items-center">
        {/* Circular Progress Ring */}
        <div className="relative w-32 h-32 mb-4">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#dc2626"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="mb-2 flex justify-center">{icon}</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
              {count}{suffix}
            </div>
          </div>
        </div>
        {/* Label */}
        <div className="text-sm text-gray-600 font-medium text-center">{label}</div>
      </div>
    </div>
  );
};

/**
 * Statistics Section Component
 */
const StatisticsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            value={20}
            suffix="+"
            label="Years of Experience"
            icon={<CalendarIcon className="w-6 h-6 text-red-600" />}
            delay={0}
          />
          <StatCard
            value={500}
            suffix="+"
            label="Success Visa"
            icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
            delay={200}
          />
          <StatCard
            value={98}
            suffix="%"
            label="Visa Ratio"
            icon={<BarChart3 className="w-6 h-6 text-red-600" />}
            delay={400}
          />
        </div>
      </div>
    </section>
  );
};

/**
 * Hero Section Component - Main landing area with call-to-action
 */
const HeroSection = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <section className="relative bg-gradient-to-r from-red-100 to-green-100 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 animate-gradient"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className={`text-center lg:text-left ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-green-600 mb-4 sm:mb-6">
                Your Gateway to 
                <span className="text-red-600 animate-fade-in animation-delay-200"> Global</span>
                <span className="text-green-600 animate-fade-in animation-delay-300"> Opportunities</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-2 sm:px-0 animate-fade-in animation-delay-400">
                Expert guidance for Work Visa,Permanent Residence and Visitor Visa. 
                Make your overseas dreams a reality with Easy Go Overseas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-slide-up animation-delay-500">
                <button
                  onClick={() => setActiveSection('contact-us')}
                  className="bg-red-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition-all-smooth hover-scale shadow-lg hover:shadow-xl active:scale-95"
                >
                  Book Consultation
                </button>
                <button
                  onClick={() => setActiveSection('our-services')}
                  className="border-2 border-green-600 text-green-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-600 hover:text-white transition-all-smooth hover-scale shadow-lg hover:shadow-xl active:scale-95"
                >
                  Our Services
                </button>
              </div>
            </div>
            
            {/* Image Placeholder */}
            <div className={`flex justify-center lg:justify-end ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="w-full max-w-md h-80 flex items-center justify-center">
                <img
                  src="/Plane_Takeoff.jpg"
                  alt="Plane Takeoff"
                  className="w-full h-full object-cover rounded-lg shadow-2xl hover-scale transition-all-smooth"
                  style={{ background: 'linear-gradient(to bottom right, #fecaca, #bbf7d0)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <StatisticsSection />
    </>
  );
};

/**
 * Visa Processing Details Page Component
 */
const VisaProcessingDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-green-600" />,
      title: "Application Assistance",
      description: "Complete guidance through the entire visa application process from start to finish."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Documentation Support",
      description: "Help with gathering, organizing, and preparing all required documents."
    },
    {
      icon: <User className="w-8 h-8 text-green-600" />,
      title: "Interview Preparation",
      description: "Mock interviews and coaching to help you succeed in your visa interview."
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-red-600" />,
      title: "Follow-up Support",
      description: "Ongoing assistance even after submission to ensure a smooth process."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </button>

        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex justify-center mb-4 sm:mb-6">
            <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
          </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Visa Processing</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Expert assistance with visa applications, documentation, and interview preparation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Our Process</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Initial consultation to understand your needs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Document checklist and preparation guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Application form filling assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Interview preparation and mock sessions</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Why Choose Us</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>20+ years of experience in visa processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>98% success rate in visa approvals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Personalized attention to each case</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Support for multiple countries and visa types</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setActiveSection && setActiveSection('contact-us')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all-smooth hover-scale shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Immigration Services Details Page Component
 */
const ImmigrationServicesDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Permanent Residency",
      description: "Complete guidance for PR applications including Express Entry, PNP, and family sponsorship programs."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-600" />,
      title: "Citizenship Applications",
      description: "Assistance with citizenship requirements, documentation, and the naturalization process."
    },
    {
      icon: <FileText className="w-8 h-8 text-red-600" />,
      title: "Document Preparation",
      description: "Expert help with gathering and organizing all required immigration documents."
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-green-600" />,
      title: "Application Review",
      description: "Thorough review of your application to ensure accuracy and completeness before submission."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </button>

        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex justify-center mb-4 sm:mb-6">
            <Shield className="w-16 h-16 sm:w-20 sm:h-20 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Immigration Services</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Comprehensive support for permanent residency and citizenship applications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Our Process</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Initial eligibility assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Program selection guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Document preparation and review</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Application submission support</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Why Choose Us</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Expert knowledge of immigration programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Personalized immigration strategy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Ongoing support throughout the process</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>High success rate in applications</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setActiveSection && setActiveSection('contact-us')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all-smooth hover-scale shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Career Counseling Details Page Component
 */
const CareerCounselingDetails = ({ onBack, setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <User className="w-8 h-8 text-green-600" />,
      title: "Career Assessment",
      description: "Comprehensive evaluation of your skills, interests, and career goals to identify the best opportunities."
    },
    {
      icon: <Target className="w-8 h-8 text-red-600" />,
      title: "Job Market Analysis",
      description: "In-depth research on job markets, salary trends, and demand for your profession in different countries."
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-green-600" />,
      title: "Skill Development",
      description: "Guidance on certifications, training, and education needed to enhance your career prospects abroad."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-red-600" />,
      title: "Career Planning",
      description: "Strategic career roadmap tailored to help you achieve your professional goals internationally."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </button>

        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <div className="flex justify-center mb-4 sm:mb-6">
            <User className="w-16 h-16 sm:w-20 sm:h-20 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Career Counseling</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
            Professional guidance to help you choose the right career path and opportunities abroad.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Information */}
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Our Process</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Initial career consultation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Skills and experience evaluation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Market research and opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Personalized career action plan</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Why Choose Us</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Expert career counselors with international experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Comprehensive market insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Tailored career strategies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Ongoing support and mentorship</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setActiveSection && setActiveSection('contact-us')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all-smooth hover-scale shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Services Section Component - Displays available services
 */
const ServicesSection = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCardClick = (serviceId) => {
    // Start flip animation
    setFlippedCard(serviceId);
    
    // Show details page after flip completes
    setTimeout(() => {
      setActiveService(serviceId);
      setFlippedCard(null);
    }, 600); // Wait for flip animation to complete (0.6s)
  };

  const handleBack = () => {
    setActiveService(null);
    setFlippedCard(null);
  };

  const services = [
    {
      icon: <FileText className="w-12 h-12 text-green-600" />,
      title: "Visa Processing",
      description: "Expert assistance with visa applications, documentation, and interview preparation.",
      onClick: () => handleCardClick('visa'),
      id: 'visa',
      backIcon: <FileText className="w-16 h-16 mb-4 text-white" />
    },
    {
      icon: <Shield className="w-12 h-12 text-red-600" />,
      title: "Immigration Services",
      description: "Comprehensive support for permanent residency and citizenship applications.",
      onClick: () => handleCardClick('immigration'),
      id: 'immigration',
      backIcon: <Shield className="w-16 h-16 mb-4 text-white" />
    },
    {
      icon: <User className="w-12 h-12 text-green-600" />,
      title: "Career Counseling",
      description: "Professional guidance to help you choose the right career path and opportunities abroad.",
      onClick: () => handleCardClick('career'),
      id: 'career',
      backIcon: <User className="w-16 h-16 mb-4 text-white" />
    }
  ];

  if (activeService === 'visa') {
    return <VisaProcessingDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }
  
  if (activeService === 'immigration') {
    return <ImmigrationServicesDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }
  
  if (activeService === 'career') {
    return <CareerCounselingDetails onBack={handleBack} setActiveSection={setActiveSection} />;
  }

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100 relative">
      <style>{`
        .flip-card {
          perspective: 1000px;
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s ease-in-out;
          transform-style: preserve-3d;
        }
        .flip-card.flipped .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 0.5rem;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #dc2626 0%, #16a34a 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
          color: white;
        }
        .flip-card-back h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .flip-card-back p {
          text-align: center;
          font-size: 0.875rem;
          opacity: 0.9;
        }
        @media (min-width: 640px) {
          .flip-card-back {
            padding: 2rem;
          }
          .flip-card-back h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .flip-card-back p {
            font-size: 0.9rem;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Our Services</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2 sm:px-0">Comprehensive solutions for your overseas journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
            const isFlipped = flippedCard === service.id;
            
            return (
              <div
                key={index}
                className={`flip-card ${isFlipped ? 'flipped' : ''} ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={service.onClick || undefined}
              >
                <div className="flip-card-inner" style={{ minHeight: '280px' }}>
                  {/* Front of Card */}
                  <div className="flip-card-front text-center p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-xl transition-all-smooth hover-scale bg-white touch-manipulation">
                    <div className="flex justify-center mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-110">
                      {service.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-0">{service.description}</p>
                    <p className="text-xs sm:text-sm text-red-600 mt-3 sm:mt-4 font-medium">Click to learn more →</p>
                  </div>
                  
                  {/* Back of Card */}
                  <div className="flip-card-back p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 mx-auto">{service.backIcon}</div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl">{service.title}</h3>
                    <p className="text-sm sm:text-base">Opening details...</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/**
 * About Us Section Component - Company information and story
 */
const AboutUsSection = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: <Target className="w-12 h-12 text-red-600" />,
      title: 'Expert Guidance',
      description: '20+ years of combined experience in immigration and visa services'
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-600" />,
      title: 'High Success Rate',
      description: '98% visa approval rate with personalized attention to each case'
    },
    {
      icon: <HeartHandshake className="w-12 h-12 text-red-600" />,
      title: 'Trusted Partner',
      description: '500+ successful visa applications and satisfied clients worldwide'
    },
    {
      icon: <Globe className="w-12 h-12 text-green-600" />,
      title: 'Global Reach',
      description: 'Expertise in multiple countries and visa categories'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-100 to-green-100 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-500 animate-gradient"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 px-2 sm:px-0">
              About <span className="text-red-600">Easy Go</span> <span className="text-green-600">Overseas</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              Your trusted partner in making global opportunities accessible
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                At Easy Go Overseas, we are dedicated to helping individuals and families achieve their dreams of living, working, and studying abroad. Our mission is to provide expert guidance, personalized service, and unwavering support throughout your immigration journey.
              </p>
              <p className="text-base sm:text-lg text-gray-600">
                We believe that everyone deserves access to global opportunities, and we're here to make that process as smooth and successful as possible.
              </p>
            </div>
            <div className={`${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">Our Vision</h2>
              <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
                To become the most trusted and reliable immigration consultancy, recognized for our integrity, expertise, and commitment to client success. We envision a world where borders don't limit dreams, and everyone can access the opportunities they deserve.
              </p>
              <p className="text-base sm:text-lg text-gray-600">
                Through continuous learning and adaptation, we stay at the forefront of immigration policies and procedures to serve our clients better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 sm:mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Why Choose Us?</h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2 sm:px-0">What sets us apart in the immigration industry</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={`bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex justify-center mb-3 sm:mb-4 transform transition-transform duration-300 hover:scale-110">
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3 text-center">{value.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 text-center">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 px-2 sm:px-0">Our Story</h2>
            <div className="space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-600 text-left">
              <p>
                Easy Go Overseas was founded with a simple yet powerful vision: to make international opportunities accessible to everyone. With over 20 years of combined experience in immigration consulting, our team has helped hundreds of individuals and families navigate the complex world of visas, immigration, and overseas opportunities.
              </p>
              <p>
                What started as a small consultancy has grown into a trusted partner for those seeking to work, study, or settle abroad. Our success is built on three pillars: expertise, integrity, and personalized service. We understand that every client's journey is unique, and we tailor our approach to meet individual needs and goals.
              </p>
              <p>
                Today, we're proud to have facilitated over 500 successful visa applications with a 98% approval rate. But more than the numbers, we're proud of the lives we've helped transform and the dreams we've helped realize. Your success is our success, and we're committed to being with you every step of the way.
              </p>
            </div>
            <div className="mt-8 sm:mt-12">
              <button
                onClick={() => setActiveSection('contact-us')}
                className="bg-red-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-red-700 transition-all-smooth hover-scale shadow-lg hover:shadow-xl active:scale-95"
              >
                Get Started Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
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
   * Handle input changes with real-time sanitization
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
      const response = await fetch(`${API_URL}/api/book-consultation`, {
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
      setSelectedDate(null);
    } catch (error) {
      setSubmitMessage('Sorry, there was an error submitting your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-red-100 to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-8 sm:mb-12 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 px-2 sm:px-0">Book Your Consultation</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-2 sm:px-0">Take the first step towards your overseas journey</p>
        </div>
        
        <div className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 ${isVisible ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg animate-bounce-in ${
              submitMessage.includes('Thank you') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitMessage}
            </div>
          )}
          
          <div className="space-y-4 sm:space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${
                  errors.name ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${
                  errors.email ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base ${
                  errors.phone ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* State Field */}
            <div>
              <label htmlFor="state" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${
                  errors.state ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg bg-white text-sm sm:text-base`}
              >
                <option value="">Select your state</option>
                {['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'].map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>
            
            {/* Service Selection */}
            <div>
              <label htmlFor="service" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Service Required *
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${
                  errors.service ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg bg-white text-sm sm:text-base`}
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
              <label htmlFor="preferredDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth ${errors.preferredDate ? 'border-red-500 error' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg text-sm sm:text-base`}
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>
            
            {/* Eligibility Section */}
            <div className="border-t pt-4 sm:pt-6 mt-4 sm:mt-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Fill other details</h3>
              
              {/* English Level */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  What is your english level<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Excellent (8+ Band)', 'Good (7 Band)', 'Average (6 Band)', 'Poor (5 Band)', 'Very Poor (4 Band)'].map((level) => (
                    <label key={level} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${
                      formData.englishLevel === level 
                        ? 'border-red-500 bg-red-50 shadow-sm' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}>
                      <input
                        type="radio"
                        name="englishLevel"
                        value={level}
                        checked={formData.englishLevel === level}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${
                        formData.englishLevel === level ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>{level}</span>
                    </label>
                  ))}
                </div>
                {errors.englishLevel && <p className="mt-1 text-sm text-red-600">{errors.englishLevel}</p>}
              </div>

              {/* Age */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Age<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Under 18 years', '18-35 years', '36-40 years', '40 years+'].map((ageGroup) => (
                    <label key={ageGroup} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${
                      formData.age === ageGroup 
                        ? 'border-red-500 bg-red-50 shadow-sm' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}>
                      <input
                        type="radio"
                        name="age"
                        value={ageGroup}
                        checked={formData.age === ageGroup}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm transition-colors ${
                        formData.age === ageGroup ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>{ageGroup}</span>
                    </label>
                  ))}
                </div>
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age}</p>}
              </div>

              {/* Education */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Education<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['PHD', 'Masters', 'Post Graduation', 'Two or more Certificates', 'Graduation', 'Diploma 3 years'].map((edu) => (
                    <label key={edu} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${
                      formData.education === edu 
                        ? 'border-red-500 bg-red-50 shadow-sm' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}>
                      <input
                        type="radio"
                        name="education"
                        value={edu}
                        checked={formData.education === edu}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${
                        formData.education === edu ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>{edu}</span>
                    </label>
                  ))}
                </div>
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
              </div>

              {/* Experience */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Experience<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['1 year', '2-3 years', '4-5 years', '6 or more years'].map((exp) => (
                    <label key={exp} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${
                      formData.experience === exp 
                        ? 'border-red-500 bg-red-50 shadow-sm' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}>
                      <input
                        type="radio"
                        name="experience"
                        value={exp}
                        checked={formData.experience === exp}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm transition-colors ${
                        formData.experience === exp ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>{exp}</span>
                    </label>
                  ))}
                </div>
                {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
              </div>

              {/* Visa Type */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Visa Type<span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Express Entry', 'PNP', 'Business Investor Program', 'Work Permit', 'Visitor Visa', 'Tourist', 'Others'].map((visa) => (
                    <label key={visa} className={`flex items-center p-2 sm:p-2.5 border rounded-lg cursor-pointer transition-all-smooth touch-manipulation ${
                      formData.visaType === visa 
                        ? 'border-red-500 bg-red-50 shadow-sm' 
                        : 'border-gray-300 hover:border-red-300 hover:bg-gray-50 active:bg-gray-100'
                    }`}>
                      <input
                        type="radio"
                        name="visaType"
                        value={visa}
                        checked={formData.visaType === visa}
                        onChange={handleInputChange}
                        className="mr-2 sm:mr-3 flex-shrink-0"
                      />
                      <span className={`text-xs sm:text-sm break-words transition-colors ${
                        formData.visaType === visa ? 'text-red-700 font-medium' : 'text-gray-700'
                      }`}>{visa}</span>
                    </label>
                  ))}
                </div>
                {errors.visaType && <p className="mt-1 text-sm text-red-600">{errors.visaType}</p>}
              </div>
            </div>
            
            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Additional Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border transition-all-smooth text-sm sm:text-base resize-none ${
                  errors.message ? 'border-red-500 error' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent focus:shadow-lg`}
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
                className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-all-smooth hover-scale shadow-lg hover:shadow-xl ${
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
              Your trusted partner for overseas, immigration, and career opportunities.
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
                <span className="text-gray-300">egoc99@gmail.com</span>
              </div>
            </div>
          </div>
          
          {/* Address */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Office Address</h4>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div className="text-gray-300">
                <p>121 Narayan Empire,</p>
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Handle section change with smooth transition
   */
  const handleSectionChange = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 150); // Brief transition delay
  };

  /**
   * Render the appropriate section based on active state
   */
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <HeroSection setActiveSection={handleSectionChange} />;
      case 'about-us':
        return <AboutUsSection setActiveSection={handleSectionChange} />;
      case 'our-services':
        return <ServicesSection setActiveSection={handleSectionChange} />;
      case 'contact-us':
        return <ContactForm />;
      default:
        return <HeroSection setActiveSection={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Always visible */}
      <Header activeSection={activeSection} setActiveSection={handleSectionChange} />
      
      {/* Main Content - Changes based on active section */}
      <main className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderSection()}
      </main>
      
      {/* Footer - Always visible */}
      <Footer />
    </div>
  );
};

// Export the main component as default
export default EasyGoOverseas;