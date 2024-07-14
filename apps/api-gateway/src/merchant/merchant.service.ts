/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { LoginMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private jwtService: JwtService,
  ) {}

  async register(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    try {
      // const { name, email, password, phoneNumber } = createMerchantDto;
      const existingMerchant = await this.findOneByEmail(
        createMerchantDto.email,
      );

      if (existingMerchant) {
        throw new ConflictException('Merchant already exists');
      }

      const hashedPassword = await bcrypt.hash(createMerchantDto.password, 10);

      const merchant = this.merchantRepository.create({
        id: randomUUID(),
        ...createMerchantDto,
        password: hashedPassword,
      });

      const savedMerchant = await this.merchantRepository.save(merchant);

      if (!savedMerchant) {
        throw new Error('Failed to save new merchant');
      }
      return savedMerchant;
    } catch (err) {
      console.log(err);
    }
  }

  async findOneByEmail(email: string): Promise<Merchant | undefined> {
    return await this.merchantRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find();
  }

  async findById(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: id },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }

    return merchant;
  }

  async update(
    id: string,
    updateMerchantDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOneBy({ id: id });

    if (!merchant) {
      throw new NotFoundException(`merchant with ID ${id} not found`);
    }
    if (updateMerchantDto.businessDescription) {
      merchant.businessDescription = updateMerchantDto.businessDescription;
    }

    if (updateMerchantDto.businessName) {
      merchant.businessName = updateMerchantDto.businessName;
    }
    if (updateMerchantDto.email) {
      merchant.email = updateMerchantDto.email;
    }

    // Save the updated user entity back to the database
    await this.merchantRepository.save(merchant);

    return merchant;
  }

  async remove(id: string): Promise<void> {
    const merchant = await this.merchantRepository.findOneBy({id: id});
  
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${id} not found`);
    }
  
    await this.merchantRepository.remove(merchant);
  }

  async validateMerchant(
    email: string,
    pass: string,
  ): Promise<Merchant | null> {
    const merchant = await this.merchantRepository.findOne({ where: {email} });
    if (merchant && (await bcrypt.compare(pass, merchant.password))) {
      return merchant;
    }
    return null;
  }

  async login(loginMerchantDto: LoginMerchantDto) {
    const { email, password } = loginMerchantDto;
    try {
      const merchant = await this.validateMerchant(email, password);
      if (!merchant) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: merchant.email, sub: merchant.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
