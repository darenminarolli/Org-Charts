import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ISummaryProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}

export interface ICount {
  title: string;
  count: number;
}
