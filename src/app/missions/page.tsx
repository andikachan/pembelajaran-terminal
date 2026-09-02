import { WorldMap } from '@/components/map/WorldMap';

export const metadata = {
  title: 'Campaign World Map — Terminal Quest',
  description: 'Explore and unlock Linux terminal training levels and missions.',
};

export default function MissionsPage() {
  return (
    <div className="py-2">
      <WorldMap />
    </div>
  );
}
