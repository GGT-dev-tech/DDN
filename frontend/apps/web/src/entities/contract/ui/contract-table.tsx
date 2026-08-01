import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Contract } from "../model/types";
import { ContractStatusBadge } from "./contract-status-badge";

interface Props {
  contracts: Contract[];
  onSelect?: (contract: Contract) => void;
}

export function ContractTable({ contracts, onSelect }: Props) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24 text-zinc-500">
                No contracts found.
              </TableCell>
            </TableRow>
          ) : (
            contracts.map((contract) => (
              <TableRow 
                key={contract.id}
                className={onSelect ? "cursor-pointer hover:bg-zinc-50" : ""}
                onClick={() => onSelect?.(contract)}
              >
                <TableCell className="font-mono">{contract.id}</TableCell>
                <TableCell>{contract.customerId}</TableCell>
                <TableCell>{contract.createdAt}</TableCell>
                <TableCell>{contract.validity}</TableCell>
                <TableCell>
                  <ContractStatusBadge status={contract.status} label={contract.statusLabel} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
