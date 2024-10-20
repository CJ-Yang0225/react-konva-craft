import { ControlPanel } from '@/components/organisms/control-panel';
import { KonvaCanvas } from '@/components/organisms/konva-canvas';

function App() {
  return (
    <div className="flex h-svh items-stretch justify-end">
      <KonvaCanvas />
      <ControlPanel />
    </div>
  );
}

export default App;
