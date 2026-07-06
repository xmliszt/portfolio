type AlertButton = {
  text: string;
  url?: string | null;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  primaryButton: AlertButton;
  secondaryButton?: AlertButton | null;
  imageURL?: string | null;
  locales?: string[];
  type: "promo" | "tips" | "community";
};
