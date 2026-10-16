import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { CreateAttributeTermDto } from './dto/create-attribute-term.dto';
import { UpdateAttributeTermDto } from './dto/update-attribute-term.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  /* ---------- Attributes ---------- */

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  // Term routes are declared before ':id' so the static "terms" segment wins.
  @Patch('terms/:termId')
  @UseGuards(JwtAuthGuard)
  updateTerm(
    @Param('termId', ParseIntPipe) termId: number,
    @Body() dto: UpdateAttributeTermDto,
  ) {
    return this.attributesService.updateTerm(termId, dto);
  }

  @Delete('terms/:termId')
  @UseGuards(JwtAuthGuard)
  removeTerm(@Param('termId', ParseIntPipe) termId: number) {
    return this.attributesService.removeTerm(termId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttributeDto) {
    return this.attributesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attributesService.remove(id);
  }

  /* ---------- Terms (nested under an attribute) ---------- */

  @Get(':id/terms')
  findTerms(@Param('id', ParseIntPipe) id: number) {
    return this.attributesService.findTerms(id);
  }

  @Post(':id/terms')
  @UseGuards(JwtAuthGuard)
  createTerm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateAttributeTermDto,
  ) {
    return this.attributesService.createTerm(id, dto);
  }
}
