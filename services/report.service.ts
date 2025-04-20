import { Decimal } from '@/generated/prisma/runtime/library';
import { ServiceResponseType } from '@/types/service.type';
import { TopTenSaleItemsChartType, TopTenSaleItemsType } from '@report/types';
import { prisma } from "@/lib/prisma";

export const getCategoryCount = async (): Promise<ServiceResponseType<{ categoryCount: number }>> => {
    try {
        const res = await prisma.category.count();
        return {
            success: true,
            message: "Success!",
            data: {
                categoryCount: res
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
};

export const getItemCount = async (): Promise<ServiceResponseType<{ itemCount: number }>> => {
    try {
        const res = await prisma.item.count();

        return {
            success: true,
            message: "Success!",
            data: {
                itemCount: res
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
};

export const getSaleCount = async (): Promise<ServiceResponseType<{ saleCount: number }>> => {
    try {
        const res = await prisma.sale.count();

        return {
            success: true,
            message: "Success!",
            data: {
                saleCount: res
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
}

export const getTotalSaleAmount = async (): Promise<ServiceResponseType<{ totalSaleAmount: number }>> => {
    try {
        const { _sum } = await prisma.saleItem.aggregate({
            _sum: {
                price: true
            }
        });

        return {
            success: true,
            message: "Success!",
            data: {
                totalSaleAmount: _sum.price ? Number(_sum.price) : 0.00
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
}

export const totalItemSold = async (): Promise<ServiceResponseType<{ totalItemSold: number }>> => {
    try {
        const res = await prisma.saleItem.aggregate({
            _sum: {
                quantity: true
            }
        });

        return {
            success: true,
            message: "Success",
            data: {
                totalItemSold: res._sum.quantity || 0
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
}

export const topTenSaleItems = async (): Promise<ServiceResponseType<TopTenSaleItemsType>> => {
    try {
        const topItems = await prisma.saleItem.groupBy({
            by: ['itemId'],
            _sum: {
                price: true
            },
            orderBy: {
                _sum: {
                    price: 'desc'
                }
            },
            take: 10,
        });

        const itemIds = topItems.map(item => item.itemId);
        const itemsWithDetails = await prisma.item.findMany({
            where: { id: { in: itemIds } },
        });

        const result: TopTenSaleItemsType = topItems.map(item => {
            const itemDetails = itemsWithDetails.find(i => i.id === item.itemId);
            return {
                itemDetails: itemDetails ? itemDetails : {
                    id: 0,
                    categoryId: 0,
                    unitId: 0,
                    name: 'Unknown',
                    price: new Decimal(0),
                    stockQuantity: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                totalAmount: item._sum.price ? Number(item._sum.price) : 0
            }
        });

        return {
            success: true,
            message: "Success!",
            data: result
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
}

export const topTenSaleItemsChart = async (): Promise<ServiceResponseType<TopTenSaleItemsChartType>> => {
    try {
        const topItems = await topTenSaleItems();

        const formattedData = topItems.data?.map(i => {
            return {
                name: i.itemDetails.name,
                value: i.totalAmount
            }
        });

        return {
            success: true,
            message: "Success",
            data: formattedData ?? []
        }
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown Error!",
            data: null
        }
    }
}