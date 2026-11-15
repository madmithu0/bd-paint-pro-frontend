import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../../components/Card';

const LEGAL_SECTIONS = {
  terms: {
    title: 'Terms of Service',
    updated: 'Version v3.0.0 LOCK',
    content: [
      '1. Platform Scope: MistriPro connects Customers, NID-verified Mistris, Field Agents, and Material Merchants under standardized 450 Sqft/day productivity benchmarks.',
      '2. Revenue Share Lock: Completed jobs are automatically split as 80% equal share to assigned Mistris, 5% to referring Agent + 15% Platform fee (or 20% Platform fee when no Agent is involved).',
      '3. Escrow Compliance: All job payments are held in bKash/Nagad live escrow until Job End OTP verification by the Customer.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'Version v3.0.0 LOCK',
    content: [
      '1. Data Security: User passwords are hashed with Argon2/Bcrypt. Uploaded NID photos and site images are scanned via ClamAV antivirus and stripped of EXIF metadata before encrypted cloud storage.',
      '2. Location Data: GPS coordinates are collected strictly during active worker attendance check-ins and are never sold to third parties.',
      '3. Audit Logging: Security events and account actions are logged in compliance with Bangladesh digital security and NBR regulations.',
    ],
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    updated: 'Version v3.0.0 LOCK',
    content: [
      '1. Pre-Start Cancellation: Jobs cancelled prior to Job Start OTP verification qualify for a 100% refund to the Customer wallet.',
      '2. Mid-Job Cancellation: Cancelled active jobs undergo proportional Sqft completion calculation, with remaining unearned escrow refunded to the Customer wallet.',
      '3. Exact Amount Match: Overpayments or mismatched TrxID submissions are automatically rejected during payment verification.',
    ],
  },
  about: {
    title: 'About Us',
    updated: 'Enterprise Full-Stack Platform',
    content: [
      'MistriPro is an enterprise construction and wall painting workforce platform built for Bangladesh.',
      'We eliminate pricing guesswork through AI wall damage detection (Nona, Damp, Fatol) and the 450 Sqft/day standard calculator while guaranteeing transparent, instant payouts for skilled workers.',
    ],
  },
  contact: {
    title: 'Contact Us',
    updated: '24/7 Support Desk',
    content: [
      'Customer & Mistri Support Helpline: +880 1700-000000',
      'Official Email: support@mistripro.com',
      'Corporate Office: Dhaka, Bangladesh',
    ],
  },
  faq: {
    title: 'Frequently Asked Questions (FAQ)',
    updated: 'Help Center',
    content: [
      'Q: How is job duration calculated? A: Every 450 Sqft equals 1 standard working day (e.g., 100 Sqft = 0.22 Day).',
      'Q: What is Mistri-Only mode? A: Customers supply their own paint and materials, paying zero material cost and only standardized labour charges.',
      'Q: When do Mistris receive payment? A: Immediately upon Customer verification of the Job End OTP, 80% of the job value is credited equally to assigned Mistri wallets.',
    ],
  },
};

export default function LegalPages() {
  const { type } = useParams();
  const activeKey = LEGAL_SECTIONS[type] ? type : 'terms';
  const currentDoc = LEGAL_SECTIONS[activeKey];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(LEGAL_SECTIONS).map(([key, section]) => (
          <Link
            key={key}
            to={`/legal/${key}`}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeKey === key
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            {section.title}
          </Link>
        ))}
      </div>

      <Card title={currentDoc.title} subtitle={currentDoc.updated}>
        <div className="space-y-4 text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
          {currentDoc.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}
