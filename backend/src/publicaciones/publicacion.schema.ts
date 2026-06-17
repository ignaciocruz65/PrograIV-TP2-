import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Publicacion extends Document {
@Prop({ required: true })
titulo: string
@Prop({ required: true })
descripcion: string
@Prop()
imagenUrl: string
@Prop({ required: true })
usuarioId: string
@Prop({ type: [String], default: [] })
likes: string[]
@Prop({ required: true })
nombreUsuario: string
@Prop({ default: null })
usuarioAvatarUrl: string
@Prop({ type: Array, default: [] })
comentarios: any[]
@Prop({ default: true })
activo: boolean
}


export const PublicacionSchema = SchemaFactory.createForClass(Publicacion)
