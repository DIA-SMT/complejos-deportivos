import { createInventoryItem, getInventory } from "@/app/actions/inventory";
import { getCurrentUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default async function InventarioPage() {
    const inventory = (await getInventory()) as any[];
    const user = await getCurrentUser();
    const isAdmin = user?.role === 'admin';

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between animate-slide-in-down">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Inventario</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Gestioná los elementos y equipamiento del complejo.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Formulario de Alta - Solo visible para admin */}
                {isAdmin && (
                    <div className="lg:col-span-1 animate-slide-in-up animation-delay-100">
                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover-lift">
                            <div className="flex flex-col space-y-1.5 p-6">
                                <h3 className="font-semibold leading-none tracking-tight">Agregar Item</h3>
                                <p className="text-sm text-muted-foreground">Nuevo elemento al inventario.</p>
                            </div>
                            <div className="p-6 pt-0">
                                {/* @ts-expect-error Server Action return type mismatch */}
                                <form action={createInventoryItem} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input id="name" name="name" placeholder="Ej: Pelota de Fútbol" required className="transition-smooth" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="quantity">Cantidad</Label>
                                        <Input id="quantity" name="quantity" type="number" placeholder="0" required className="transition-smooth" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Descripción (Opcional)</Label>
                                        <Input id="description" name="description" placeholder="Marca, estado, etc." className="transition-smooth" />
                                    </div>
                                    <Button type="submit" className="w-full hover-lift transition-smooth">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Agregar
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de Inventario */}
                <div className={isAdmin ? "lg:col-span-2 animate-slide-in-up animation-delay-200" : "lg:col-span-3 animate-slide-in-up animation-delay-100"}>
                    <div className="rounded-md border overflow-x-auto hover-lift">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No hay items cargados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    inventory.map((item, index) => (
                                        <TableRow key={item.id} className="transition-all duration-200 hover:bg-muted/50 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    <span className="text-xs text-muted-foreground sm:hidden">
                                                        {item.description || "-"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{item.description || "-"}</TableCell>
                                            <TableCell className="text-right font-semibold">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
