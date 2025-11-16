// Contract Templates
const CONTRACT_TEMPLATES = {
    freelance: (data) => `
FREELANCE SERVICE AGREEMENT

This Freelance Service Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}, by and between:

SERVICE PROVIDER: ${data.party_a}
CLIENT: ${data.party_b}

1. SERVICES
The Service Provider agrees to provide the following services:
${data.scope}

2. TERM
This Agreement shall commence on ${new Date().toLocaleDateString()} and shall continue for ${data.duration || 'the duration of the project'}.

3. COMPENSATION
The Client agrees to pay the Service Provider ${data.amount ? '$' + data.amount : 'the agreed amount'} for the services rendered.

Payment terms: Net 30 days from invoice date.

4. INDEPENDENT CONTRACTOR
The Service Provider is an independent contractor and not an employee of the Client.

5. CONFIDENTIALITY
Both parties agree to maintain confidentiality of any proprietary information shared during this engagement.

6. INTELLECTUAL PROPERTY
Upon full payment, all work product created under this Agreement shall be the property of the Client.

7. TERMINATION
Either party may terminate this Agreement with 14 days written notice.

8. GOVERNING LAW
This Agreement shall be governed by the laws of the applicable jurisdiction.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

SERVICE PROVIDER: ${data.party_a}
Signature: _______________________
Date: _______________________

CLIENT: ${data.party_b}
Signature: _______________________
Date: _______________________
`,

    employment: (data) => `
EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is made as of ${new Date().toLocaleDateString()}, between:

EMPLOYER: ${data.party_a}
EMPLOYEE: ${data.party_b}

1. POSITION AND DUTIES
The Employee is hired for the position described as:
${data.scope}

2. TERM OF EMPLOYMENT
Employment shall commence on ${new Date().toLocaleDateString()} and continue for ${data.duration || 'an indefinite period'}.

3. COMPENSATION
The Employee shall receive compensation of ${data.amount ? '$' + data.amount : 'the agreed salary'} per annum.

4. BENEFITS
The Employee shall be entitled to benefits as per company policy.

5. WORKING HOURS
Standard working hours and conditions shall apply as per company policy.

6. CONFIDENTIALITY
The Employee agrees to maintain strict confidentiality regarding company information.

7. NON-COMPETE
During employment and for a reasonable period thereafter, the Employee agrees not to engage in competing business activities.

8. TERMINATION
Either party may terminate this employment with appropriate notice as per applicable law.

9. GOVERNING LAW
This Agreement is governed by applicable employment laws.

EMPLOYER: ${data.party_a}
Signature: _______________________
Date: _______________________

EMPLOYEE: ${data.party_b}
Signature: _______________________
Date: _______________________
`,

    partnership: (data) => `
PARTNERSHIP AGREEMENT

This Partnership Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}, by and between:

PARTNER A: ${data.party_a}
PARTNER B: ${data.party_b}

1. PARTNERSHIP PURPOSE
The partners agree to enter into a partnership for the following purpose:
${data.scope}

2. TERM
This partnership shall commence on ${new Date().toLocaleDateString()} and continue for ${data.duration || 'an indefinite period'}.

3. CAPITAL CONTRIBUTIONS
Initial capital contributions: ${data.amount ? '$' + data.amount : 'As agreed by partners'}

4. PROFIT AND LOSS SHARING
Profits and losses shall be shared equally unless otherwise agreed in writing.

5. MANAGEMENT AND DUTIES
Both partners shall have equal rights in the management of partnership business.

6. DECISION MAKING
Major decisions require unanimous consent of all partners.

7. BOOKS AND RECORDS
Accurate books and records shall be maintained and available to all partners.

8. DISSOLUTION
The partnership may be dissolved by mutual agreement or as provided by law.

9. GOVERNING LAW
This Agreement shall be governed by applicable partnership laws.

PARTNER A: ${data.party_a}
Signature: _______________________
Date: _______________________

PARTNER B: ${data.party_b}
Signature: _______________________
Date: _______________________
`,

    service: (data) => `
SERVICE AGREEMENT

This Service Agreement ("Agreement") is made as of ${new Date().toLocaleDateString()}, between:

SERVICE PROVIDER: ${data.party_a}
CLIENT: ${data.party_b}

1. SERVICES TO BE PROVIDED
The Service Provider agrees to provide the following services:
${data.scope}

2. TERM
This Agreement is effective from ${new Date().toLocaleDateString()} and shall continue for ${data.duration || 'the agreed period'}.

3. FEES AND PAYMENT
Service fees: ${data.amount ? '$' + data.amount : 'As agreed'}
Payment schedule: As invoiced

4. SERVICE STANDARDS
Services shall be performed in a professional and workmanlike manner.

5. WARRANTIES
The Service Provider warrants that services will meet industry standards.

6. LIABILITY
Liability shall be limited to the amount paid for services under this Agreement.

7. TERMINATION
Either party may terminate with written notice as specified in this Agreement.

8. DISPUTE RESOLUTION
Any disputes shall be resolved through mediation before legal action.

9. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the parties.

SERVICE PROVIDER: ${data.party_a}
Signature: _______________________
Date: _______________________

CLIENT: ${data.party_b}
Signature: _______________________
Date: _______________________
`,

    nda: (data) => `
NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into as of ${new Date().toLocaleDateString()}, by and between:

DISCLOSING PARTY: ${data.party_a}
RECEIVING PARTY: ${data.party_b}

1. PURPOSE
The purpose of this Agreement is to protect confidential information related to:
${data.scope}

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by either party that is marked as confidential or should reasonably be considered confidential.

3. OBLIGATIONS
The Receiving Party agrees to:
- Keep all Confidential Information strictly confidential
- Not disclose to any third parties without written consent
- Use Confidential Information only for the stated purpose
- Protect information with the same care as their own confidential information

4. TERM
This Agreement shall remain in effect for ${data.duration || '2 years'} from the date of disclosure.

5. EXCLUSIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

6. RETURN OF MATERIALS
Upon request, all confidential materials shall be returned or destroyed.

7. NO LICENSE
This Agreement does not grant any license or rights to the Confidential Information.

8. REMEDIES
Breach of this Agreement may result in irreparable harm, and injunctive relief may be sought.

9. GOVERNING LAW
This Agreement is governed by applicable laws.

DISCLOSING PARTY: ${data.party_a}
Signature: _______________________
Date: _______________________

RECEIVING PARTY: ${data.party_b}
Signature: _______________________
Date: _______________________
`
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_TEMPLATES;
}
