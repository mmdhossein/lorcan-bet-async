import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
    constructor(@InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>) {

    }
  
  //this should be transactional
     async reserveInventory(productId:number, quantity:number) {
        try {
          //check inventory if we have enough quantity and deduce it, can you do it as a procedure or transactional
          //in condition of not enough send error message
          await this.inventoryRepository.manager.transaction( async (tranasctionalEntityManager:EntityManager)=>{
            const inventory = await tranasctionalEntityManager.createQueryBuilder(Inventory, 'inventory').setLocak('pessimistic_write').where('inventory.productId = :productId', {productId}).getOne()
            if(!inventory){
              return {error:`inventory for product id: ${productId} not found`}
            }
            if(inventory.quantity >= quantity){
              inventory.quantity -= quantity
              await tranasctionalEntityManager.save(inventory)
            }else{
              return {error:`inventory quantity is not sufficient, quantity available: ${inventory.quantity}`}
            }
          })
        
            console.log('reserveInventory')
            return result
        } catch (e) {
            return {error: e.message}
        }

    }
}
