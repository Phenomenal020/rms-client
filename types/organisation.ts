// //GET /school response
// export type schoolPayload = {
//     // Required stuff
//     id: string; // server-generated UUID to uniquely identify the school
//     schoolName: string; // Required - always present when school exists
//     schoolRegistrationId: string; // Server-generated UUID, shared with teachers to join the school
//     // Optional stuff
//     schoolAddress: string | null;
//     schoolMotto: string | null;
//     schoolTelephone: string | null;
//     schoolEmail: string | null;
//     // schoolLogoUrl: string | null | undefined;  TODO
//     createdAt: string;
//     updatedAt: string;
// } | null;

// // PATCH /school request payload
// export type updateSchoolPayload = {
//     // Required stuff
//     schoolName: string;
//     // Optional stuff
//     // string? field available for update; undefined? not sent. null? field was cleared.
//     schoolAddress?: string | null | undefined;
//     schoolMotto?: string | null | undefined;
//     schoolTelephone?: string | null | undefined;
//     schoolEmail?: string | null | undefined;
// };

// // POST /school request payload
// export type createSchoolPayload = {
//     // Required stuff
//     schoolName: string;
//     // Optional stuff
//     // string? field available for update; undefined? not sent. null? field was cleared.
//     schoolAddress?: string | null | undefined;
//     schoolMotto?: string | null | undefined;
//     schoolTelephone?: string | null | undefined;
//     schoolEmail?: string | null | undefined;
// }

// // Raw response from successful POST /school. 
// // Returns a success message and the server-generated school registration ID.
// export type CreateSchoolResponse = {
//     success: string;
//     schoolRegistrationId: string;
// };

// // Raw response from successful PATCH /school. 
// // Returns a success message and null data field.
// export type UpdateSchoolResponse = {
//     success: string;
//     data: null;
// };

// // Error response from API (both POST and PATCH)
// export type apiErrorResponse = {
//     statusCode: number;
//     message: string | string[];
//     error: string;
// }

export type organisation = {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    metadata: {
        address: string | null;
        motto: string | null;
        telephone: string | null;
        email: string | null;
    };
}

export type AddMemberPayload = {
    email: string;
    // organizationId: string;
}