export interface IRegisterUser {

    name:string;

    email:string;

    password:string;

    phone?:string;

    role:"TENANT"|"LANDLORD";

}

