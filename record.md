## 0x01 table字段数据遍历
```typescript
const getMapList = async () => {
    setIsLoading(true);

    const tempList = [];

    // 读取列表
    const dynamicFieldPage = await suiClient.getDynamicFields({parentId: MAPS_TABLE_ID});
    const resultData = dynamicFieldPage.data;
    for (const index in resultData) {
        const objectId = resultData[index].objectId;
        const map = await getMapObject(objectId);
        map.index = parseInt(index);
        tempList.push(map);
    }

    setIsLoading(false);

    return tempList;
}

const getMapObject = async (id: string) => {
    const res = await suiClient.getObject({
        id,
        options: {
            showContent: true,
        }
    })

    const base = res.data.content.fields;
    // console.log('base object', base);
    const mapObject = base?.value as SuiMoveObject;
    const {fields} = mapObject;

    return fields as unknown as MapOnChain;
}

```

```typescript
Passing transaction results as arguments
You can use the result of a transaction command as an argument in subsequent transaction commands. Each transaction command method on the transaction builder returns a reference to the transaction result.

// Split a coin object off of the gas object:
const [coin] = txb.splitCoins(txb.gas, [txb.pure(100)]);
// Transfer the resulting coin object:
txb.transferObjects([coin], txb.pure(address));

When a transaction command returns multiple results, you can access the result at a specific index either using destructuring, or array indexes.

// Destructuring (preferred, as it gives you logical local names):
const [nft1, nft2] = txb.moveCall({ target: '0x2::nft::mint_many' });
txb.transferObjects([nft1, nft2], txb.pure(address));

// Array indexes:
const mintMany = txb.moveCall({ target: '0x2::nft::mint_many' });
txb.transferObjects([mintMany[0], mintMany[1]], txb.pure(address));

```


```typescript
        signAndExecuteTransaction(
            {
                transaction: tb,
                options: {
                    // showEvents: true,
                    // showBalanceChanges: true,
                    showEffects: true,
                }
            },
            {
                onSuccess: (tx) => {
                    suiClient.waitForTransaction((tx) => {
                        
                    })

                    setDigest(result.digest);
                },
                onError: (result) => {
                    console.log('trans error', result.message);
                    setMessage(result.message);
                }
            },
        );

```
