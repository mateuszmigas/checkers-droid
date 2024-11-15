import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

export const WrongBrowserAlert = () => {
  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <Alert className="w-[400px]">
        <AlertTitle>Wrong Browser</AlertTitle>
        <AlertDescription>
          This app is only supported on Chrome.
        </AlertDescription>
      </Alert>
    </div>
  );
};

