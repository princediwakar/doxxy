
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, Plus, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientModal } from "@/components/PatientModal";

// Mock patient data
const patientData = [
  { id: 1, name: "Sarah Johnson", gender: "Female", age: 34, phone: "(555) 123-4567", lastVisit: "10/05/2023", status: "Active" },
  { id: 2, name: "Robert Williams", gender: "Male", age: 45, phone: "(555) 234-5678", lastVisit: "22/04/2023", status: "Scheduled" },
  { id: 3, name: "Emma Davis", gender: "Female", age: 28, phone: "(555) 345-6789", lastVisit: "15/03/2023", status: "Active" },
  { id: 4, name: "Thomas Brown", gender: "Male", age: 52, phone: "(555) 456-7890", lastVisit: "05/05/2023", status: "Inactive" },
  { id: 5, name: "Lisa Wilson", gender: "Female", age: 39, phone: "(555) 567-8901", lastVisit: "30/04/2023", status: "Active" },
  { id: 6, name: "Kevin Miller", gender: "Male", age: 41, phone: "(555) 678-9012", lastVisit: "18/04/2023", status: "Active" },
  { id: 7, name: "Emily Thompson", gender: "Female", age: 33, phone: "(555) 789-0123", lastVisit: "12/05/2023", status: "Scheduled" },
  { id: 8, name: "Daniel Martinez", gender: "Male", age: 29, phone: "(555) 890-1234", lastVisit: "02/05/2023", status: "Active" },
];

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Filter patients based on search term
  const filteredPatients = patientData.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patient: any) => {
    setSelectedPatient(patient);
    setOpenModal(true);
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setOpenModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage and view patient records</p>
        </div>
        <Button onClick={handleNewPatient}>
          <Plus size={18} className="mr-2" />
          Add Patient
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Gender</TableHead>
              <TableHead className="hidden md:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow 
                key={patient.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handlePatientClick(patient)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                      <User size={16} className="text-primary" />
                    </div>
                    {patient.name}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{patient.gender}</TableCell>
                <TableCell className="hidden md:table-cell">{patient.age}</TableCell>
                <TableCell className="hidden md:table-cell">{patient.phone}</TableCell>
                <TableCell className="hidden lg:table-cell">{patient.lastVisit}</TableCell>
                <TableCell>
                  <Badge variant={
                    patient.status === "Active" ? "default" :
                    patient.status === "Scheduled" ? "outline" : "secondary"
                  }>
                    {patient.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <PatientModal
        open={openModal}
        onOpenChange={setOpenModal}
        patient={selectedPatient}
      />
    </div>
  );
};

export default Patients;
