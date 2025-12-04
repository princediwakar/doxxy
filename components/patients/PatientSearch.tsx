import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PatientSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export const PatientSearch = ({ searchTerm, onSearchTermChange }: PatientSearchProps) => {
  return (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name or medical ID..."
            className="pl-10 border-border focus:ring-primary"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
  );
};

