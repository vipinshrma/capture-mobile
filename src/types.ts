export type CaptureKind = "link" | "image" | "note" | "document" | "task" | "voice";

export type Capture = {
  id: string;
  kind: CaptureKind;
  title: string;
  body?: string;
  source?: string;
  category?: string;
  metadataTitle?: string;
  metadataDescription?: string;
  metadataImage?: string;
  metadataSiteName?: string;
  localFileUri?: string;
  createdAt: string;
  favourite?: boolean;
  archived?: boolean;
};

export type RootStackParamList = {
  Onboarding: undefined;
  EmptyInbox: undefined;
  Main: NavigatorScreenParams<TabParamList> | undefined;
  ShareCapture: undefined;
  CaptureDetail: { id: string; returnTo?: "Review" } | undefined;
  SearchResults: { query: string };
  Settings: undefined;
  Privacy: undefined;
  Archive: undefined;
  Favourites: undefined;
};

export type TabParamList = {
  Inbox: undefined;
  Search: undefined;
  Review: undefined;
};
import type { NavigatorScreenParams } from "@react-navigation/native";
