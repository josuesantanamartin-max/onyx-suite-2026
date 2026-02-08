# Legal Documentation Implementation Guide

## Overview

This guide provides instructions for integrating the Privacy Policy and Terms of Service into Onyx Suite 2026.

## Documents Created

1. **Privacy Policy** (`legal/PRIVACY_POLICY.md`)
   - GDPR compliant
   - Comprehensive data collection disclosure
   - User rights (access, deletion, portability)
   - DPO contact information
   - International data transfer provisions
   - Cookie policy
   - AI and automated decision-making disclosure

2. **Terms of Service** (`legal/TERMS_OF_SERVICE.md`)
   - Service description
   - User acceptance and responsibilities
   - Intellectual property rights
   - Limitation of liability
   - Warranty disclaimers
   - Cancellation and termination policy
   - Dispute resolution
   - Governing law provisions

## Key Features

### Privacy Policy Highlights
- **Data Collection:** Detailed specification of all data types collected (financial, personal, usage, AI interactions)
- **Legal Basis:** Clear explanation of GDPR legal bases for processing
- **User Rights:** Complete enumeration of GDPR rights with exercise instructions
- **Third Parties:** Full disclosure of service providers (Supabase, Google Gemini, Vercel, Sentry)
- **Data Retention:** Specific retention periods for different data types
- **Security:** Technical and organizational security measures
- **Self-Service:** Instructions for users to exercise rights through the app

### Terms of Service Highlights
- **Service Description:** Comprehensive overview of all features
- **User Conduct:** Clear acceptable use and prohibited activities
- **Financial Disclaimer:** Explicit statement that app is not financial advice
- **AI Disclaimer:** Clear explanation of AI limitations and user responsibility
- **Liability Limitations:** Standard limitations appropriate for SaaS
- **Cancellation:** Clear process for account deletion and data export

## Required Actions Before Going Live

### 1. Update Contact Information
Replace placeholder contact information in both documents:

**In PRIVACY_POLICY.md:**
- Line 11: `privacy@onyxsuite.com` (update if different)
- Line 12: `dpo@onyxsuite.com` (update if different)
- Lines 481-485: Mailing address

**In TERMS_OF_SERVICE.md:**
- Lines 548-552: Mailing address
- Lines 579-591: Contact emails and mailing address

### 2. Update Jurisdiction
Replace `[Your Jurisdiction]` with your actual jurisdiction:

**In TERMS_OF_SERVICE.md:**
- Line 407: Governing law jurisdiction
- Line 422: Court jurisdiction

### 3. Designate Data Protection Officer (DPO)
- If you're processing data of EU residents at scale, you may need a formal DPO
- Update `dpo@onyxsuite.com` with actual DPO contact
- Consider whether you need a formal DPO appointment under GDPR

### 4. Review Third-Party Service Agreements
Ensure you have proper agreements with:
- ✅ Supabase (Backend/Auth)
- ✅ Google Gemini Pro (AI)
- ✅ Vercel (Hosting)
- ✅ Sentry (Error Monitoring)
- ✅ Vercel Analytics (Analytics)

### 5. Cookie Consent Implementation
Consider implementing a cookie consent banner for EU users:
- Essential cookies (authentication, security)
- Analytics cookies (Vercel Analytics)
- Preference cookies (dashboard layouts, themes)

### 6. Data Export Functionality
Implement the self-service data export mentioned in Privacy Policy:
- Location: Settings > Privacy > Download My Data
- Format: JSON (as mentioned in policy)
- Should include all user data

### 7. Account Deletion Functionality
Implement the self-service account deletion:
- Location: Settings > Privacy > Delete Account
- Confirmation dialog with warnings
- 30-day grace period (optional but recommended)
- Data retention for legal compliance (7 years for financial data)

## Integration Recommendations

### 1. Create Legal Pages Component
Create a component to display legal documents:

```typescript
// components/legal/LegalPage.tsx
interface LegalPageProps {
  document: 'privacy' | 'terms';
}
```

### 2. Add Footer Links
Add links to legal documents in your app footer:
- Privacy Policy
- Terms of Service
- Cookie Policy (if separate)

### 3. Terms Acceptance on Signup
Consider requiring users to accept terms during signup:
```typescript
<Checkbox>
  I agree to the <Link to="/legal/terms">Terms of Service</Link> and 
  <Link to="/legal/privacy">Privacy Policy</Link>
</Checkbox>
```

### 4. Privacy Settings Page
Create a privacy settings page with:
- Data export button
- Account deletion button
- Cookie preferences
- AI opt-out toggle
- Marketing preferences

### 5. Update Routes
Add routes for legal pages:
```typescript
<Route path="/legal/privacy" element={<LegalPage document="privacy" />} />
<Route path="/legal/terms" element={<LegalPage document="terms" />} />
```

## Compliance Checklist

### GDPR Compliance
- [x] Privacy Policy created
- [x] Data collection disclosed
- [x] Legal basis for processing specified
- [x] User rights documented
- [x] Data retention periods specified
- [x] DPO contact provided
- [x] International transfer safeguards mentioned
- [ ] Cookie consent banner implemented
- [ ] Data export functionality implemented
- [ ] Account deletion functionality implemented
- [ ] DPO designated (if required)

### Terms of Service
- [x] Terms of Service created
- [x] Service description provided
- [x] User responsibilities defined
- [x] Liability limitations specified
- [x] Cancellation policy defined
- [x] Dispute resolution process outlined
- [ ] Terms acceptance on signup implemented
- [ ] Jurisdiction specified
- [ ] Contact information updated

## Maintenance

### Regular Reviews
- Review and update legal documents annually
- Update when adding new features or data collection
- Update when changing third-party services
- Update when regulations change

### Version Control
- Keep previous versions of legal documents
- Document material changes
- Notify users of significant changes

### User Notifications
When updating legal documents:
1. Update "Last Updated" date
2. Send email notification for material changes
3. Show in-app notification
4. Require re-acceptance for significant changes (optional)

## Additional Considerations

### 1. Age Verification
- Policy states minimum age of 16
- Consider implementing age verification on signup
- Have process for handling underage accounts

### 2. Data Breach Response
- Have incident response plan ready
- GDPR requires notification within 72 hours
- Contact: security@onyxsuite.com

### 3. Data Processing Agreements (DPAs)
Ensure you have DPAs with:
- Supabase
- Google (for Gemini)
- Vercel
- Sentry

### 4. International Considerations
If serving users globally:
- Consider CCPA compliance (California)
- Consider LGPD compliance (Brazil)
- Consider PIPEDA compliance (Canada)
- Adjust policies as needed

### 5. Financial Regulations
Since this is a financial management app:
- Ensure compliance with financial data protection laws
- Consider PCI DSS if handling payment cards
- Consult with legal counsel on financial regulations

## Support Resources

### Legal Consultation
- Consult with a lawyer specializing in:
  - Data protection (GDPR, CCPA)
  - SaaS/Technology law
  - Financial services (if applicable)

### Templates and Tools
- GDPR compliance checklist
- Cookie consent solutions (e.g., Cookiebot, OneTrust)
- Privacy policy generators (for updates)

### Regulatory Bodies
- **EU:** European Data Protection Board (EDPB)
- **US:** Federal Trade Commission (FTC)
- **UK:** Information Commissioner's Office (ICO)

## Next Steps

1. **Immediate (Before Launch):**
   - [ ] Update all contact information
   - [ ] Specify jurisdiction
   - [ ] Designate DPO (if required)
   - [ ] Implement terms acceptance on signup
   - [ ] Add footer links to legal documents

2. **Short-term (Within 30 days):**
   - [ ] Implement cookie consent banner
   - [ ] Create privacy settings page
   - [ ] Implement data export functionality
   - [ ] Implement account deletion functionality

3. **Ongoing:**
   - [ ] Review legal documents quarterly
   - [ ] Monitor regulatory changes
   - [ ] Update as features are added
   - [ ] Maintain version history

## Questions?

For questions about implementing these legal documents:
- **Legal:** Consult with qualified legal counsel
- **Technical:** Contact your development team
- **Privacy:** Contact your DPO or privacy officer

---

**Note:** This guide is for informational purposes only and does not constitute legal advice. Consult with qualified legal counsel before deploying these documents in production.
