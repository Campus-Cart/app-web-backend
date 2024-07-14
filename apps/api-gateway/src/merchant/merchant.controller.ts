/* eslint-disable prettier/prettier */
// merchant.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { LoginMerchantDto } from './dto/create-merchant.dto';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('/register')
  async register(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantService.register(createMerchantDto);
  }

  @Post('/login')
  async login(@Body() loginMerchantDto: LoginMerchantDto) {
    return this.merchantService.login(loginMerchantDto);
  }

  @Get()
  async findAll() {
    return this.merchantService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.merchantService.findById(id);
  }
  
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(id, updateMerchantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.merchantService.remove(id);
  }
}