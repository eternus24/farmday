import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ShopDetailView from './ShopDetailView';
import api from '../../assets/js/api/ShopApi';
import { getStoreInfo } from '../../assets/js/api/ShopApi';

const ShopDetail = () => {

    const {id} = useParams()
    const [product,setProduct] = useState(null)
    const [loading,setLoading] = useState(true)
    const [images,setImages] = useState([])//상세 이미지
    const [store,setStore] = useState(null)

    //상품 + 생산자 정보 불러오기
    const loadDetail = async()=>{
        try{
            const res = await api.get(`/api/products/${id}`)
            setProduct(res.data)
        }catch(err){
            console.error('상품 상세 조회 실패: ',err)
        }finally{
            setLoading(false)
        }
    }
    //상품 상세 정보
    const loadImages = async () => {
        try {
            const res = await api.get(`/api/products/${id}/images`);
            console.log("이미지 응답:", res.data);
            setImages(res.data);
        } catch (err) {
            console.error("상품 이미지 불러오기 실패:", err);
        }
    };

    //상점
    const loadStore = async () => {
        if (!product?.producerId) return;
        try {
            const info = await getStoreInfo(product.producerId);
            setStore(info);
        } catch (err) {
            console.error("상점 조회 실패:", err);
        }
        };

    useEffect(()=>{//데이터 불러오기
        loadDetail()
        loadImages()
    },[id])

    useEffect(() => {
    if (product) loadStore();
    }, [product]);

    if(loading) return <div className='text-center py-5'>불러오는 중...</div>
    if(!product) return <div className='text-center py-5'>상품을 찾을 수 없습니다...</div>

    console.log(product);

    return (
    <div>
        {product && <ShopDetailView product={product} images={images} store={store}
    productId={product.productId} storeId={product.storeId}  />}
    </div>
    );
};

export default ShopDetail;