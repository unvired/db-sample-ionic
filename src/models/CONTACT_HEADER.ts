export class CONTACT_HEADER {
    // Contact Id
    ContactId: number;

    // Contact Name
    ContactName: string;

    // Phone
    Phone: string;

    // Email
    Email: string;
}

export class UIModel {
    section: string;
    contactHeaders: CONTACT_HEADER[];
}
