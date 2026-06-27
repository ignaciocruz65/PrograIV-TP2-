import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import type { PerfilUsuario } from "./usuarios.types";

@Schema({ timestamps: true }) // el timestamp hace que createdAt y updatedAt se creen automáticamente por mongoose
export class Usuario extends Document {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    apellido: string;

    @Prop({ required: true, unique: true, lowercase: true })
    correo: string;

    @Prop({ required: true, unique: true })
    nombreUsuario: string;

    @Prop({ required: true })
    passwordHash: string;

    @Prop({ required: true })
    fechaNacimiento: string;

    @Prop({ required: true, maxlength: 200 })
    descripcionBreve: string;

    @Prop({ type: String, default: 'usuario' })
    perfil: PerfilUsuario;

    @Prop({ default: true })
    activo: boolean

    @Prop({ type: String, default: null })
    imagenPerfilUrl: string | null;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
