import { Request, Response } from "express";
import prisma from "../db/prisma";

export const createAuction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { title, description, startingBid, reservePrice, buyNowPrice, endsAt } =
    req.body;
  const creatorId = req.user.id;

  if (!title || !description || !startingBid || !endsAt) {
    return res.status(400).json({
      message: "Title, description, starting bid, and end time are required.",
    });
  }

  try {
    const newAuction = await prisma.auction.create({
      data: {
        title,
        description,
        startingBid,
        currentBid: startingBid,
        reservePrice,
        endsAt: new Date(endsAt),
        creatorId,
        status: "ACTIVE",
      },
    });

    return res.status(201).json({
      message: "Auction created successfully",
      auction: newAuction,
    });
  } catch (error: any) {
    console.error("Error creating auction:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllAuctions = async (
  req: Request,
  res: Response
): Promise<any> => {
  const auctions = await prisma.auction.findMany();
  return res.status(200).json({
    message: "Auctions retrieved successfully",
    auctions,
  });
};

export const getAllAuctionsById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const auctionId = req.params.id;
    const auction = await prisma.auction.findUnique({
      where: {
        id: Number(auctionId),
      },
      include: {
        bids: true,
        creator: true,
      },
    });
    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }
    return res.status(200).json({
      message: "Auction retrieved successfully",
      auction,
    });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const updateAuctionStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const auctionId = req.params.id;
  const auction = await prisma.auction.findUnique({
    where: {
      id: Number(auctionId),
    },
  });

  if (!auction) {
    return res.status(404).json({
      message: "Auction not found",
    });
  }
};

export const deleteAuction = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const auctionId = req.params.id;
    const auction = await prisma.auction.findUnique({
      where: {
        id: Number(auctionId),
      },
      include: {
        bids: true,
        creator: true,
      },
    });
    if (!auction) {
      return res.status(404).json({
        message: "Auction not found",
      });
    }
    if (auction.creatorId !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to delete this auction",
      });
    }
    await prisma.auction.delete({
      where: {
        id: Number(auctionId),
      },
    });
    return res.status(200).json({
      message: "Auction deleted successfully",
      auction,
    });
  } catch (error: any) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const placeBid = async (req: Request, res: Response): Promise<any> => {
  const auctionId = req.params.id;
  const { bidAmount } = req.body;

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: Number(auctionId) },
      include: {
        bids: true,
        creator: true,
      },
    });

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "ACTIVE") {
      return res.status(403).json({ message: "Auction is not active" });
    }

    if (!bidAmount || bidAmount <= auction.currentBid) {
      return res
        .status(400)
        .json({ message: "Bid amount must be higher than the current bid" });
    }

    if (auction.reservePrice && bidAmount < auction.reservePrice) {
      return res
        .status(400)
        .json({ message: "Bid amount does not meet the reserve price" });
    }

    const bid = await prisma.bid.create({
      data: {
        auctionId: Number(auctionId),
        amount: bidAmount,
        userId: req.user.id,
      },
    });

    const updatedAuction = await prisma.auction.update({
      where: { id: Number(auctionId) },
      data: { currentBid: bidAmount },
    });

    return res.status(201).json({
      message: "Bid placed successfully",
      bid,
      updatedAuction,
    });
  } catch (error: any) {
    console.error("Error placing bid:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getBidsForAuction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const auctionId = req.params.id;

  const auction = await prisma.auction.findUnique({
    where: { id: Number(auctionId) },
  });

  if (!auction) {
    return res.status(404).json({ message: "Auction not found" });
  }

  const bids = await prisma.bid.findMany({
    where:{
      auctionId: Number(auctionId)
    },
    include: {
      user: true,
    }
  })

  return res.status(200).json({
    message: "Bids retrieved successfully",
    bids,
  })
  
};

export const getUserBids = async (
  req: Request,
  res: Response
): Promise<any> => {
 try {
   const userId = req.user.id
 
   const bids = await prisma.bid.findMany({
     where:{
       userId: Number(userId)
     },
     include: {
       auction: true,
     }
   })
 
   return res.status(200).json({
     message: "Bids retrieved successfully",
     bids,
   })
 } catch (error: any) {
   console.log(error);
   res
     .status(500)
     .json({ message: "Internal server error", error: error.message });
  
 }
};
