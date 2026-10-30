import { PawsRoom } from "./_room/paws-room";
import { PawsSessionProvider } from "./_session/paws-session-provider";

export default function PawsPage() {
  return (
    <PawsSessionProvider>
      <PawsRoom />
    </PawsSessionProvider>
  );
}
