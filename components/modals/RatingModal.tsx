import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { LinearButton } from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
  doctorName: string;
  existingRating?: {
    rating: number;
    message: string;
  } | null;
  submitting: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  doctorName,
  existingRating,
  submitting,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');

  // Initialize with existing rating if available
  useEffect(() => {
    if (existingRating) {
      setSelectedRating(existingRating.rating);
      setComment(existingRating.message);
    } else {
      setSelectedRating(0);
      setComment('');
    }
  }, [existingRating, visible]);

  const handleSubmit = async () => {
    const success = await onSubmit(selectedRating, comment);
    if (success) {
      onClose();
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setSelectedRating(star)}
            style={styles.starButton}
          >
            <FontAwesome
              name={star <= selectedRating ? 'star' : 'star-o'}
              size={32}
              color={star <= selectedRating ? '#FFD700' : '#ccc'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (selectedRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select a rating';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {existingRating ? 'Update Rating' : 'Rate Doctor'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <FontAwesome name="times" size={24} color={colors.grey} />
              </TouchableOpacity>
            </View>

            {/* Doctor Name */}
            <Text style={styles.doctorName}>Dr. {doctorName}</Text>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              {renderStars()}
              <Text style={styles.ratingText}>{getRatingText()}</Text>
            </View>

            {/* Comment Section */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <TextArea
                attr={{
                  field: 'comment',
                  placeholder: 'Share your experience with this doctor...',
                  value: comment,
                  handleChange: (field: string, value: string) => setComment(value),
                  multiline: true,
                  icon: {
                    name: 'chatbubble-outline',
                    type: 'Ionicons',
                    color: colors.primary
                  }
                }}
                style={styles.commentInput}
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <LinearButton
                btnInfo={{
                  styles: {
                    marginTop: 0,
                    backgroundColor: selectedRating > 0 && comment.trim() ? colors.primary : colors.grey,
                  }
                }}
                textInfo={{
                  text: submitting ? 'Submitting...' : (existingRating ? 'Update Rating' : 'Submit Rating'),
                  color: colors.green
                }}
                iconInfo={{
                  type: 'Ionicons',
                  name: 'star',
                  size: 16,
                  color: colors.white
                }}
                handleBtnClick={handleSubmit}
                disabled={selectedRating === 0 || !comment.trim() || submitting}
              />
            </View>

            {submitting && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Submitting your rating...</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.primary,
  },
  closeButton: {
    padding: 5,
  },
  doctorName: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
});

export default RatingModal;
