import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IChartsProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  site: any;
  context: WebPartContext
}

export interface IUser {
  Id: number | string;
  lastName?: string;
  lastName0?: string;
  reporting?: string; // Supervisor's name
  Role_x002f_Seniority?: string;
  Account?: string;
  location?: string;
  Team?: string;
  fullName: string;
  children: IUser[];
  isDummy?: boolean;
}