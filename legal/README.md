# Legal Documentation

This directory contains all legal documents for Onyx Suite 2026.

## Documents

### 1. Privacy Policy
**File:** `PRIVACY_POLICY.md`  
**Purpose:** GDPR-compliant privacy policy explaining data collection, usage, and user rights.

**Key Sections:**
- Data collection specification (financial, personal, usage, AI)
- Legal basis for processing under GDPR
- User rights (access, deletion, portability, etc.)
- Third-party service providers
- Data retention policies
- Security measures
- Cookie policy
- International data transfers

### 2. Terms of Service
**File:** `TERMS_OF_SERVICE.md`  
**Purpose:** Legal agreement governing use of Onyx Suite 2026.

**Key Sections:**
- Service description and availability
- User accounts and responsibilities
- Acceptable use and prohibited activities
- Intellectual property rights
- AI and financial disclaimers
- Limitation of liability
- Cancellation and termination
- Dispute resolution

### 3. Implementation Guide
**File:** `IMPLEMENTATION_GUIDE.md`  
**Purpose:** Technical guide for integrating legal documents into the application.

**Contents:**
- Required actions before going live
- Integration recommendations
- Compliance checklist
- Maintenance procedures

## Quick Reference

### Contact Information to Update
Before deploying to production, update the following:

1. **Email Addresses:**
   - `privacy@onyxsuite.com`
   - `dpo@onyxsuite.com`
   - `legal@onyxsuite.com`
   - `support@onyxsuite.com`
   - `security@onyxsuite.com`
   - `accessibility@onyxsuite.com`

2. **Mailing Address:**
   - Replace `[Your Business Address]`, `[City, Postal Code]`, `[Country]`

3. **Jurisdiction:**
   - Replace `[Your Jurisdiction]` with actual jurisdiction

### Data Collected (Summary)

**Personal Data:**
- Email, name, user persona
- Family member information (optional)

**Financial Data:**
- Transactions, accounts, budgets, debts, goals
- Asset information (including cadastral data)

**Usage Data:**
- Device info, IP address, usage patterns
- Performance metrics, session data

**AI Data:**
- User prompts and AI responses
- AI recommendations and feedback

### User Rights (GDPR)

1. **Right of Access** - Request copy of data
2. **Right to Rectification** - Correct inaccurate data
3. **Right to Erasure** - Delete personal data
4. **Right to Restriction** - Limit data processing
5. **Right to Portability** - Export data in machine-readable format
6. **Right to Object** - Object to certain processing
7. **Right to Withdraw Consent** - Withdraw consent anytime
8. **Right to Complain** - File complaint with supervisory authority

### Third-Party Services

- **Supabase:** Backend and authentication
- **Google Gemini Pro:** AI features
- **Vercel:** Hosting and deployment
- **Sentry:** Error monitoring
- **Vercel Analytics:** Usage analytics

## Implementation Checklist

### Before Launch
- [ ] Update all contact information
- [ ] Specify jurisdiction
- [ ] Designate DPO (if required)
- [ ] Review third-party service agreements
- [ ] Add legal document links to app footer
- [ ] Implement terms acceptance on signup

### Post-Launch (30 days)
- [ ] Implement cookie consent banner
- [ ] Create privacy settings page
- [ ] Implement data export functionality
- [ ] Implement account deletion functionality

### Ongoing
- [ ] Review documents quarterly
- [ ] Update when adding new features
- [ ] Monitor regulatory changes
- [ ] Maintain version history

## Legal Compliance

### GDPR (EU)
- ✅ Privacy Policy created
- ✅ User rights documented
- ✅ Data retention specified
- ✅ DPO contact provided
- ⚠️ Cookie consent needed (implementation)
- ⚠️ Data export needed (implementation)
- ⚠️ Account deletion needed (implementation)

### Other Jurisdictions
Consider compliance with:
- **CCPA** (California, USA)
- **LGPD** (Brazil)
- **PIPEDA** (Canada)
- **UK GDPR** (United Kingdom)

## Maintenance

### When to Update

**Immediately:**
- Adding new data collection
- Changing third-party services
- Significant feature changes
- Regulatory requirement changes

**Annually:**
- General review and updates
- Contact information verification
- Third-party service review

### Version Control
- Keep previous versions archived
- Document all material changes
- Update "Last Updated" date
- Notify users of significant changes

## Important Notes

⚠️ **Legal Disclaimer:** These documents are templates and should be reviewed by qualified legal counsel before use in production.

⚠️ **Jurisdiction Specific:** Some provisions may need adjustment based on your jurisdiction and target markets.

⚠️ **Regular Updates:** Legal requirements change; review and update documents regularly.

## Resources

- **GDPR Official Text:** https://gdpr-info.eu/
- **EU Data Protection Board:** https://edpb.europa.eu/
- **Privacy Policy Generator:** https://www.privacypolicies.com/
- **Terms Generator:** https://www.termsofservicegenerator.net/

## Support

For questions about these legal documents:
- **Legal Advice:** Consult qualified legal counsel
- **Implementation:** See `IMPLEMENTATION_GUIDE.md`
- **Privacy Questions:** Contact your DPO

---

**Last Updated:** February 4, 2026  
**Version:** 1.0
