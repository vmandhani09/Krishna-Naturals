'use client';

import { useState } from 'react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Where can I buy bulk dry fruits in India?',
    answer: 'You can place orders directly through our Bulk Ordering page, and we deliver across India.',
  },
  {
    question: 'Does Krishna Naturals offer wholesale rates?',
    answer: 'Yes, we offer competitive wholesale pricing for bulk orders.',
  },
  {
    question: 'Can I get dry fruits for cheap in bulk?',
    answer: 'We offer affordable bulk prices without compromising on quality.',
  },
  {
    question: 'Do you have an offline store?',
    answer: 'Currently, we operate online only but deliver PAN India.',
  },
  {
    question: 'Are bulk orders delivered safely?',
    answer: 'Yes, all bulk orders are packed securely and shipped with tracking.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="bg-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border rounded-lg shadow-sm transition-all duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                {faq.question}
                <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-40 py-2' : 'max-h-0 py-0'
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
